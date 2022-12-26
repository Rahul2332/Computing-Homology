
#include <vector>
#include <iostream>
#include <algorithm>
#include <cstddef>
#include <cassert>
#include <thread>

using namespace std;

class Matrix
{
private:
    std::vector<std::vector<int> > matrix;
    int row_size;
    int col_size;
    int rank;
    bool isRref;

    void swap_rows(int i, int j);
    void divide_rows(int i, int val);
    void add_multiple_row(int i, int j, int val, int start, int end);

public:
    Matrix(int i, int j, int init);
    ~Matrix();

    void populate(int rows, int columns, int **mat);
    void rref();
    int get_rank();
    void print();
    std::vector<int> get_pivots();
    Matrix *get_ker();
};
