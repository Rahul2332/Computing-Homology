#!/bin/bash

#Enter File Path as argument to shell script
echo "$1"

# Calculate 0-Holes in GTS File
g++ pe.cpp Matrix.cpp -w
./a.out "$1"

# Correct the orientation of the GTS file
g++ orient_simplex_v2.cpp -std=c++11
./a.out "$1"

# One Hole Computation
python3 hole_computation.py "$1"

# Visualization
npm run dev

