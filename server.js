const express = require('express');
const { spawn } = require('child_process');
const app = express();
const port = 3000;

// Function to send commands to Stockfish
function runStockfish(command, multipv = 1) {
  return new Promise((resolve, reject) => {
    const stockfish = spawn('stockfish');
    let output = '';

    stockfish.stdout.on('data', (data) => {
      output += data.toString();
    });

    stockfish.stderr.on('data', (data) => {
      reject(data.toString());
    });

    stockfish.on('close', (code) => {
      resolve(output);
    });

    // Set the number of lines to calculate (MultiPV)
    stockfish.stdin.write(`setoption name MultiPV value ${multipv}\n`);
    stockfish.stdin.write(command + '\n');
    stockfish.stdin.write('go\n');
    stockfish.stdin.write('quit\n');
  });
}

// API to evaluate a position with multiple lines
app.get('/evaluate', async (req, res) => {
  const fen = req.query.fen; // FEN position from query parameters
  const multipv = req.query.multipv || 1; // Number of lines (MultiPV)
  
  if (!fen) {
    return res.status(400).send('FEN parameter is required');
  }

  try {
    const stockfishOutput = await runStockfish(`position fen ${fen}`, multipv);
    res.send(stockfishOutput);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Stockfish API listening at http://localhost:${port}`);
});


