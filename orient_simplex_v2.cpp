#include <bits/stdc++.h>
#include <fstream>
using namespace std;

vector<int> features;

struct Vertices{
    string coordinates;
    int edge;
};
struct Edges
{
    int start, end; // start and end vertex
    int faces[2] = {0};   // the two faces connected with this edge
};
struct Faces
{
    // pair<int,int> edge1,edge2,edge3;//edge and its orientation
    pair<int, int> edge[3] = {{0,0}, {0,0}, {0,0}};
    bool visited = false;
    int chain[2] = {0};
};

vector<int> line_to_int(string buffer)
{
    string trash;
    vector<int> vec;
    for (int i = 0; i < buffer.size(); i++)
    {
        if (buffer[i] == ' ')
        {
            if(trash.size())
                vec.push_back(stoi(trash));
            trash.clear();
        }
        else
            trash += buffer[i];
    }
    vec.push_back(stoi(trash));
    trash.clear();
    return vec;
}

int main(int argc, char **argv)
{
    //take filename as argument and open
    if (argc != 2)
    {
        std::cout << "Need file name" << std::endl;
        exit(1);
    }
    ifstream infile;
    string filename,out_filename;
    filename = argv[1];
    infile.open(filename);

    if (!infile)
    {
        cout << "Unable to open file" << endl;
        exit(1);
    }
    string buffer;
    getline(infile, buffer);
    features = line_to_int(buffer);

    Vertices vertices[features[0] + 1];
    Edges edges[features[1] + 1];
    Faces faces[features[2] + 1];

    for (int i = 1; i < features[0] + 1; i++)
    {
        buffer.clear();
        getline(infile, buffer);
        vertices[i].coordinates = buffer;
    }
    for (int i = 1; i < features[1] + 1; i++)
    {
        buffer.clear();
        getline(infile, buffer);
        vector<int> temp = line_to_int(buffer);
        edges[i].start = temp[0];
        edges[i].end = temp[1];
        vertices[temp[0]].edge = i;
        vertices[temp[1]].edge = i;
    }
    for (int i = 1; i < features[2] + 1; i++)
    {
        buffer.clear();
        getline(infile, buffer);
        vector<int> temp = line_to_int(buffer);
        for (int j = 0; j < 3; j++)
        {
            faces[i].edge[j].first = temp[j];
            if (edges[temp[j]].faces[0] == 0)
                edges[temp[j]].faces[0] = i;
            else
                edges[temp[j]].faces[1] = i;
        }
    }
    // Scanned for vertices edges and faces,
    // now lets correct their orientation
    // we defined an orientation for our simplicial complex
    infile.close();
    //Taking all the different connected components vertices and defining their orientation
    infile.open("holes0_buffer.txt");
    buffer.clear();
    getline(infile,buffer);
    if(buffer[buffer.size()-1] == ' ')
        buffer.erase(buffer.begin() + buffer.size()-1);
    // cout<<buffer<<endl;
    vector<int> temp = line_to_int(buffer);

    stack<int> pile; // stack to keep track of visited faces during traversal

    for(int i=0;i<temp.size();i++)
    {
        faces[edges[vertices[temp[i]].edge].faces[0]].chain[0] = edges[vertices[temp[i]].edge].start;
        faces[edges[vertices[temp[i]].edge].faces[0]].chain[1] = edges[vertices[temp[i]].edge].end;
        pile.push(edges[vertices[temp[i]].edge].faces[0]);
    }

    while (!pile.empty())
    {
        int top = pile.top(); // tells us the face no. we are currently at.
        pile.pop();

        /* Steps to take:
         * Check if the face is already visited or not.
         * Use the chain to write signs of all the edges connected to that face.
         * Pick up the remaining edges and stack their faces. Also write an opposite chain in them.
         */
        if (faces[top].visited == true)
            continue;
        faces[top].visited = true;
        for (int i = 0; i < 3; i++)
        {
            int s = edges[faces[top].edge[i].first].start;
            int e = edges[faces[top].edge[i].first].end;

            if (faces[top].chain[0] == s && faces[top].chain[1] == e)
                faces[top].edge[i].second = 1; // correct orientation
            else if (faces[top].chain[0] == e && faces[top].chain[1] == s)
                faces[top].edge[i].second = -1; // reverse the orientation

            if (faces[top].chain[0] == s && faces[top].chain[1] != e)      // reverse edge
                faces[top].edge[i].second = -1;                            // reverse the orientation
            else if (faces[top].chain[0] == e && faces[top].chain[1] != s) // straight
                faces[top].edge[i].second = 1;                             // correct orientation

            if (faces[top].chain[1] == s && faces[top].chain[0] != e)      // straight
                faces[top].edge[i].second = 1;                             // correct orientation
            else if (faces[top].chain[1] == e && faces[top].chain[0] != s) // reverse edge
                faces[top].edge[i].second = -1;                            // reverse the orientation
        }
        // check;
        
        for (int i = 0; i < 3; i++)
        {
            int orientation;
            if(faces[top].edge[i].second == 1)
                orientation = -1;
            else
                orientation = 1;

            int face_id = 0;
            if (edges[faces[top].edge[i].first].faces[0] == top)
            {
                face_id = edges[faces[top].edge[i].first].faces[1];
                if(face_id)
                    pile.push(face_id);
            }
            else
            {
                face_id = edges[faces[top].edge[i].first].faces[0];
                if(face_id)
                    pile.push(face_id);
            // cout<<face_id<<endl;
            }
            // check;
            if(face_id)
            {
                if (orientation == 1)
                {
                    faces[face_id].chain[0] = edges[faces[top].edge[i].first].start;
                    faces[face_id].chain[1] = edges[faces[top].edge[i].first].end;
                }
                else
                {
                    faces[face_id].chain[1] = edges[faces[top].edge[i].first].start;
                    faces[face_id].chain[0] = edges[faces[top].edge[i].first].end;
                }
            }
            // check;
        }
        // check;

        // print_edges_storage;
        // print_faces_storage;

        ofstream fout ("oriented_buffer.gts");
        fout<<features[0]<<" "<<features[1]<<" "<<features[2]<<endl;
        for(int i=1;i<features[0]+1;i++)
            fout<<vertices[i].coordinates<<endl;
        for(int i=1;i<features[1]+1;i++)
            fout<<edges[i].start<<" "<<edges[i].end<<endl;
        for(int i=1;i<features[2]+1;i++)
        {
            for(int j=0;j<3;j++)
            {
                // if(faces[i].edge[j].second)
                    fout<<faces[i].edge[j].first<<" "<<faces[i].edge[j].second<<endl;
            }
        }
        
    }
    cout<<endl<<"- Orientation corrected of GTS file"<<endl;
}
