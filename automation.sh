#!/bin/bash

#Enter File Path as argument to shell script
#File should be present in dist folder
#Argument should be like: ./dist/filename.gts

# This should be at the top of the script to get the start time of the script
start=$(date +%s.%N)

# Calculate 0-Holes in GTS File
g++ pe.cpp Matrix.cpp -w
./a.out "$1"

if [ $? -eq 0 ];
then
    echo ""
else
    echo "FAILED: pe.cpp Matrix.cpp"
    exit
fi

# Correct the orientation of the GTS file
g++ orient_simplex_v2.cpp -std=c++11
./a.out "$1"

if [ $? -eq 0 ];
then
    echo ""
else
    echo "FAILED: orient_simplex_v2.cpp"
    exit
fi

# One Hole Computation
python3 hole_computation.py "$1"

if [ $? -eq 0 ];
then
    echo ""
else
    echo "FAILED: hole_computation.py"
    exit
fi

duration=$(echo "$(date +%s.%N) - $start" | bc)
execution_time=`printf "%.2f seconds" $duration`

echo "EXECUTION TIME: $execution_time"


# Visualization
npm run dev

if [ $? -eq 0 ];
then
    echo ""
else
    echo "FAILED: npm run dev"
    exit
fi
