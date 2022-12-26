#include "Matrix.h"


Matrix::Matrix(int i, int j, int init)
    : rank(0), isRref(false)
{
    row_size = i;
    col_size = j;
    // Sets the initial value
    for (int it = 0; it < i; it++)
    {
        std::vector<int> temp;
        matrix.push_back(temp);
        for (int jt = 0; jt < j; jt++)
        {
            matrix[it].push_back(init);
        }
    }
}

// helper functions
void Matrix::swap_rows(int i, int j)
{
    if ((i < 0 && i >= matrix.size()) || (j < 0 && j >= matrix[0].size()))
    {
        std::cout << "Wrong Index Error Line No: " << __LINE__ << " File : " << __FILE__ << std::endl;
        return;
    }
    for (int col = 0; col < col_size; col++)
    {
        std::swap(matrix[i][col], matrix[j][col]);
    }
}

void Matrix::divide_rows(int i, int val)
{
    if ((i < 0 && i >= matrix.size()))
    {
        std::cout << "Wrong Index Error Line No: " << __LINE__ << " File : " << __FILE__ << std::endl;
        return;
    }
    for (int col = 0; col < col_size; col++)
    {
        matrix[i][col] /= val;
    }
}

void Matrix::add_multiple_row(int i, int j, int val, int start, int end)
{
    if ((i < 0 && i >= matrix.size()) || (j < 0 && j >= matrix[0].size()))
    {
        std::cout << "Wrong Index Error Line No: " << __LINE__ << " File : " << __FILE__ << std::endl;
        return;
    }

    for (int col = start; col < end; col++)
    {
        matrix[i][col] += val * matrix[j][col];
    }
}

void Matrix::rref()
{
    isRref = true;
    int lead = 0;

    for (int row = 0; row < row_size; row++)
    {
        if (lead >= col_size)
            return;
        int i = row;
        while (matrix[i][lead] == 0)
        {
            i++;
            if (i >= row_size)
            {
                i = row;
                lead++;
                if (lead >= col_size)
                    return;
            }
        }
        swap_rows(i, row);
        divide_rows(row, matrix[row][lead]);
        for (i = 0; i < row_size; i++)
        {
            if (i != row)
            {
                // std::thread t1(&Matrix::add_multiple_row, this, i, row, -matrix[i][lead], col_size / 2, col_size);
                add_multiple_row(i, row, -matrix[i][lead], 0, col_size);
                // t1.join();
            }
        }
    }
}

void Matrix::populate(int rows, int columns, int **mat)
{
    isRref = false;
    if (rows > row_size && columns > col_size)
    {
        std::cout << "Wrong Index Error Line No: " << __LINE__ << " File : " << __FILE__ << std::endl;
        return;
    }

    for (int i = 0; i < rows; i++)
    {
        for (int j = 0; j < columns; j++)
        {
            matrix[i][j] = mat[i][j];
        }
    }
}

Matrix *Matrix::get_ker()
{
    if (!isRref)
        rref();
    if (!rank)
        get_rank();

    std::vector<int> pivots;
    int lead = 0, rows = 0;
    while (pivots.size() != rank)
    {
        if (matrix[lead][rows] == 0)
        {
            lead++;
        }
        else
        {
            pivots.push_back(lead);
            rows++;
            lead++;
        }
    }
    if (pivots.size() == 0)
    {
        return nullptr;
    }
    int new_row = col_size - pivots[0];
    int new_col = new_row - rank;
    int **mat;
    mat = new int *[new_row];
    for (int i = 0; i < new_row; i++)
        mat[i] = new int[new_row];
    int cur_piv = 0;
    int cur_col = pivots[cur_piv];
    for (int i = 0; i < new_col; i++)
    {
        while (cur_col < new_row && cur_col == pivots[cur_piv])
        {
            cur_col++;
            if (cur_piv != pivots.size() - 1)
                cur_piv++;
        }
        for (int j = 0; j < rank; j++)
        {
            mat[j][i] = -matrix[j][cur_col];
        }
        mat[cur_col - pivots[0]][i] = 1;
        cur_col++;
    }
    Matrix *new_matrix = new Matrix(new_row, new_col, 0);
    new_matrix->populate(new_row, new_col, mat);
    return new_matrix;
}

int Matrix::get_rank()
{
    if (!isRref)
        rref();
    int lead = 0;
    for (int i = 0; i < row_size; i++)
    {
        while (matrix[i][lead] == 0)
        {
            lead++;
            if (lead >= col_size)
            {
                return rank;
            }
        }
        rank++;
        if (rank >= row_size || rank >= col_size)
            return rank;
    }
    return 0;
}

std::vector<int> Matrix::get_pivots()
{
    std::vector<int> pivots;
    if (!isRref)
        rref();
    int lead = 0;
    for (int i = 0; i < row_size; i++)
    {
        while (matrix[i][lead] == 0)
        {
            lead++;
            if (lead >= col_size)
            {
                return pivots;
            }
        }
        pivots.push_back(lead);
        rank++;
        if (rank >= row_size || rank >= col_size)
            return pivots;
    }
    return pivots;
}

void Matrix::print()
{
    for (int i = 0; i < row_size; i++)
    {
        for (int j = 0; j < col_size; j++)
        {
            std::cout << matrix[i][j] << " ";
        }
        std::cout << "\n";
    }
}

Matrix::~Matrix()
{
    matrix.clear();
}
