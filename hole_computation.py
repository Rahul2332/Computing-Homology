import numpy as np
from sympy import Matrix,pprint,shape
import sys

class Solver:
    def read_file(self,filename):
        f = open(filename,"r+")
        line = (f.readline())
        properties_count = line.split(' ')
        self.vertex_count = int(properties_count[0])
        self.edge_count = int(properties_count[1])
        self.face_count = int(properties_count[2])

        self.content_list = f.readlines()[self.vertex_count: self.vertex_count + self.edge_count + 3*self.face_count]

    def create_del2(self):
        rows,cols = self.edge_count, self.face_count
        arr = np.zeros((rows,cols), dtype = int)
        i=0
        j=0
        while(i<3*self.face_count):
            edge1 = self.content_list[self.edge_count + i].split()
            edge2 = self.content_list[self.edge_count + i + 1].split()
            edge3 = self.content_list[self.edge_count + i + 2].split()
            arr[int(edge1[0])-1][j] = int(edge1[1])
            arr[int(edge2[0])-1][j] = int(edge2[1])
            arr[int(edge3[0])-1][j] = int(edge3[1])
            i = i + 3
            j=j+1
        self.matrix_del2 = arr

    def create_del1(self):
        rows, cols = (self.vertex_count, self.edge_count)
        # arr_del1 = [[0 for i in range(cols)] for j in range(rows)]
        arr_del1 = np.zeros((rows,cols), dtype=int)
        for i in range(0, self.edge_count):
            vertex = self.content_list[i].split()
            v1 = int(vertex[0])
            v2 = int(vertex[1])
            arr_del1[v1 - 1][i] = -1
            arr_del1[v2 - 1][i] = 1
        self.matrix_del1 = arr_del1

    def matrix_manipulation(self):
        img_del2_tuple = Matrix(self.matrix_del2).columnspace()
        len_img_del2 = len(img_del2_tuple)
        temp_img_del2 = img_del2_tuple[0]
        for i in range(len(img_del2_tuple)-1):
            temp_img_del2 = temp_img_del2.col_insert(i+1,img_del2_tuple[i+1])
        img_del2 = temp_img_del2
        self.img_del2 = img_del2

        #Create Matrix(ker_del1)
        ker_del1 = Matrix(self.matrix_del1).nullspace()
        len_ker_del1 = len(ker_del1)
        temp_ker_del1 = ker_del1[0]
        for i in range(len(ker_del1)-1):
            temp_ker_del1 = temp_ker_del1.col_insert(i+1,ker_del1[i+1])
        ker_del1 = temp_ker_del1
        self.ker_del1 = ker_del1

        print("Expected Beti1: ",len_ker_del1 - len_img_del2)

        joint = img_del2.row_join(ker_del1)
        self.img_del2_joint_ker_del1 = joint

    def joint_matrix_calculation(self):
        joint = self.img_del2_joint_ker_del1
        #Taking RREF of the Joint Matrix
        rref_final = joint.rref()
        pivot_points_tuple = rref_final[1]


        holes1 = []
        one_chains = list()
        for x in pivot_points_tuple:
            if (x > shape(self.img_del2)[1] - 1):
                holes1.append(x - shape(self.img_del2)[1] + 1)
        print("Number of 1-Homology Groups formed: ",len(holes1))
        print()
        print("Representative 1 Cycles:")
        chain_beg = list()
        chain_end = list()

        for x in holes1:
            temp_edg_list = self.ker_del1.col(x-1)
            chain = ''
            beg = list()
            end = list()
            for i in range(len(temp_edg_list)):
                buff = self.content_list[i].split()
                if temp_edg_list[i] == 1:
                    beg.append(int(buff[0]) - 1) 
                    end.append(int(buff[1]) - 1)
                elif temp_edg_list[i] == -1:
                    beg.append(int(buff[1]) - 1) 
                    end.append(int(buff[0]) - 1)
            chain_beg.append(beg)
            chain_end.append(end)
        return chain_beg,chain_end


import time

start = time.time()

# file_name = input("Enter the filename for reading the data")
file_name = "oriented_buffer.gts"
print("Filename: ",file_name,"\n")
holes1 = Solver()
holes1.read_file(file_name)
holes1.create_del2()
holes1.create_del1()
holes1.matrix_manipulation()
chain_beg,chain_end = holes1.joint_matrix_calculation()


f = open("one_holes_vertices.js", "w")
# f.write(str(len(chain_beg)) + '\n')
f.write("export function hello() {\n")
f.write("   const viz_points" + " = [")
for i in range(len(chain_beg)):
    diction = {}
    for j in range(len(chain_beg[i])):
        diction[chain_beg[i][j]] = chain_end[i][j]

    lizt = []
    start = chain_beg[i][0]
    key = chain_beg[i][0]
    lizt.append(start)
    while(1):
        lizt.append(diction[key])
        key = diction[key]
        if(start == key):
            break
    # f.write(str(len(lizt)) + '\n')
    f.write("[")
    for k in range(len(lizt)):
        if(k==len(lizt)-1):
            f.write(str(lizt[k]+1))
        else:
            f.write(str(lizt[k]+1) + ',')
        print(str(lizt[k]+1), end= ', ')
    print('\n')
    if(i == len(chain_beg)-1):
        f.write(']')
    else:
        f.write('],')
f.write(']\n')
f.write("   return viz_points\n}\n")

path_file = sys.argv[1]
name_file = path_file.split("/")[-1]

f.write("export function name_of_file() {\n")
f.write("   return " + "\"" + str(name_file) + "\"" + "\n}")

f.close()

        