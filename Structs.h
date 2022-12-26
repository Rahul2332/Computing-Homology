#include <iostream>
#include <fstream>
#include <sstream>
#include <array>
#include <vector>
#include <chrono>

struct boundary_matrix
{
    int num_rows, num_cols;
    int **mat;
};

struct boundary_matrix make_boundary(std::vector<std::array<int, 2> > edges, int num_ver);