# Install Dependencies
```bash
pip install sympy # pip/conda for python library installation
pip install numpy # pip/conda for python library installation
npm install #it will install all node dependencies
```

# Grant Executable Permission to script
```bash
sudo chmod +x automation.sh
```

# To Run Program
```bash
./automation.sh ./dist/"$filename.gts"
```
example:
```bash
./automation.sh ./dist/torus20.gts
./automation.sh ./dist/head_red.gts
```

*Shell script contains all the program execution commands, just give executable permission to script and run.*

<!-- **If user wants to run each file seperately, following are the commands for it:**

- Calculate 0-holes
```bash
g++ pe.cpp Matrix.cpp
./a.out ./dist/"$filename.gts"
```

- Correct the orientation of the GTS file.
```bash
g++ orient_simplex_v2.cpp -std=c++11
./a.out ./dist/"$filename.gts"
```

- Compute One-Holes
```bash
python3 hole_computation.py "$filename.gts"
```

- Visualization Setup :
```bash
npm run dev #it will start the development environment
``` -->