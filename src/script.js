// // importing required packages
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { NumberKeyframeTrack } from "three";
import { hello,name_of_file } from "../one_holes_vertices";
// const gui = new dat.GUI()

var arr = [];
var ln_points = hello();
// horse seashell bunny cube sphere5 sphere20 Tangle Torus space_station x_wing helix2 RzTorus
var fileName = name_of_file();

function readTextFile() {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", fileName, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            var allText = rawFile.responseText;
            arr = allText.split("\n");
            fillArrays(arr);
        }
    };
    rawFile.send();
}
readTextFile();

var scene, camera, renderer, parentTransform;
var controls;
var obj;
var stats;
const EdgeGeometrys = [];
const Scale = 5;
const raycaster = new THREE.Raycaster();
raycaster.params.Line.threshold = 1;
const pointer = new THREE.Vector2(); 

const vertices = [
    [0, 0, 0]
];
class Vertex {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
const points = [];
const edges = [null];
const faces = [];

let num_vertices, num_edges, num_triangles;
let betti0 = 0,
    betti1 = 0,
    betti2 = 0;

let markedPointRadii = { radius: 1 };

var adj;
var heightFunctionList;
var LinkStruct;
// heightFunctionList[0] = null;

function fillArrays(arr) {
    [num_vertices, num_edges, num_triangles] = arr[0].split(" ");
    num_vertices = Number(num_vertices);
    num_edges = Number(num_edges);
    num_triangles = Number(num_triangles);

    heightFunctionList = new Array(num_vertices + 1).fill(null);
    adj = new Array(num_vertices + 1).fill(0).map(j => [])

    let i;

    function sphereHeightFunction(x, y) {
        return (((1 * Scale) * (1 * Scale) - (x * x) - (y * y)));
    }
    for (i = 1; i <= num_vertices; i++) {
        let [x, y, z] = arr[i].split(" ");
        let X = Scale * Number(x);
        let Y = Scale * Number(y);
        let Z = Scale * Number(z);
        let vertex = new Vertex(X, Y, Z);

        vertices.push(vertex);

        // if (Z >= 0)
        //     heightFunctionList[i] = sphereHeightFunction(X, Y);
        // if (Z < 0)
        //     heightFunctionList[i] = -sphereHeightFunction(X, Y);
        heightFunctionList[i] = Z;
        // heightFunctionList[i] = Math.random();
    }

    for (; i <= num_vertices + num_edges; i++) {

        let [e1, e2] = arr[i].split(" ");
        e1 = parseInt(e1);
        e2 = parseInt(e2);

        adj[e1].push(e2);
        adj[e2].push(e1);

        edges.push([e1, e2]);
    }
    console.log("adj: ", adj);


    for (; i <= num_vertices + num_edges + num_triangles; i++) {
        let [e1, e2, e3] = arr[i].split(" ");
        let repeteArr = [...edges[Number(e1)], ...edges[Number(e2)], ...edges[Number(e3)]];
        const set = new Set();
        for (let e of repeteArr)
            set.add(e);

        repeteArr.splice(0, repeteArr.length);
        repeteArr = Array.from(set);


        faces.push(repeteArr);
    }
    console.log(vertices, edges, faces);


    // sorting faces wrt coordinates
    function compare(a, b) {
        if (vertices[a[0]].z < vertices[b[0]].z) {
            return -1;
        }
        if (vertices[a[0]].z > vertices[b[0]].z) {
            return 1;
        }
        return 0;
    }

    faces.sort(compare);

    console.log(vertices);
    makePoints();
    makeLink();

    init();
    animate();
}

function makeLink() {
    LinkStruct = new Array(num_vertices + 1).fill(null).map(j => []);

    for (let i = 1; i <= num_vertices; i++) {
        let subTriangles = [];
        for (let f of faces) {
            if (f[0] == i || f[1] == i || f[2] == i) {
                let tempFace = f;
                let index = tempFace.indexOf(i);
                tempFace.splice(index, 1);
                tempFace.unshift(i);
                subTriangles.push(tempFace);
            }
        }

        let visitedTriangles = new Array(subTriangles.length).fill(false);
        let link = [];
        let tempSet = new Set();

        for (let s = 0; s < subTriangles.length; s++) {
            if (visitedTriangles[s]) continue;

            let currTriangle = subTriangles[s];
            if (i == 1) console.log(subTriangles[s][0], subTriangles[s][1], subTriangles[s][2]);
            let currVertex = subTriangles[s][1];
            tempSet.add(currVertex);
            if (i == 1) console.log(currVertex);
            currVertex = subTriangles[s][2];
            if (i == 1) console.log(currVertex);
            tempSet.add(currVertex);
            visitedTriangles[s] = true;

            for (let st = 0; st < subTriangles.length; st++) {
                if (visitedTriangles[st]) continue;

                if (subTriangles[st][1] == currVertex) {
                    currVertex = subTriangles[st][2];
                    tempSet.add(currVertex);
                    visitedTriangles[st] = true;
                    st = 0;
                    continue;
                }
                if (subTriangles[st][2] == currVertex) {
                    currVertex = subTriangles[st][1];
                    tempSet.add(currVertex);
                    visitedTriangles[st] = true;
                    st = 0;
                    continue;
                }
            }
        }
        link = Array.from(tempSet);
        LinkStruct[i] = link;
        if (i == 1) console.log(subTriangles, link);
    }
    console.log(LinkStruct);
}


function makePoints() {
    points[0] = null;
    for (let i = 1; i <= num_vertices; i++) {
        points.push(new THREE.Vector3(vertices[i].x, vertices[i].y, vertices[i].z));
    }
}


var triangulateKFacesWithShapes = (function() {
    var _ctr = new THREE.Vector3();
    var _plane = new THREE.Plane();
    var _q = new THREE.Quaternion();
    var _y = new THREE.Vector3();
    var _x = new THREE.Vector3();
    var X = new THREE.Vector3(1.0, 0.0, 0.0);
    var Y = new THREE.Vector3(0.0, 1.0, 0.0);
    var Z = new THREE.Vector3(0.0, 0.0, 1.0);
    var _tmp = new THREE.Vector3();
    var _basis = new THREE.Matrix4();
    return function(points, faces) {
        var object = new THREE.Object3D();
        // var material = new THREE.MeshBasicMaterial({
        //     color: new THREE.Color(0x0095DD),
        //     side: THREE.DoubleSide,
        //     wireframeLinewidth: 2,
        //     wireframe: true,
        // });
        var material = new THREE.MeshNormalMaterial({
            // color: new THREE.Color(0x0095DD),
            opacity: 0.5,
            transparent: true,
            side: THREE.DoubleSide
        });
        for (var f = 0, len = faces.length; f < len; f++) {
            var face = faces[f];
            // compute centroid
            _ctr.setScalar(0.0);
            for (var i = 0, l = face.length; i < l; i++) {
                _ctr.add(points[face[i]]);
            }
            _ctr.multiplyScalar(1.0 / l);
            // compute face normal
            _plane.setFromCoplanarPoints(_ctr, points[face[0]], points[face[1]]);
            var _z = _plane.normal;
            // compute basis
            _q.setFromUnitVectors(Z, _z);
            _x.copy(X).applyQuaternion(_q);
            _y.crossVectors(_x, _z);
            _y.normalize();
            _basis.makeBasis(_x, _y, _z);
            _basis.setPosition(_ctr);
            // project the 3D points on the 2D plane
            var projPoints = [];
            for (i = 0, l = face.length; i < l; i++) {
                _tmp.subVectors(points[face[i]], _ctr);
                projPoints.push(new THREE.Vector2(_tmp.dot(_x), _tmp.dot(_y)));
            }
            // create the geometry (Three.js triangulation with ShapeBufferGeometry)
            var shape = new THREE.Shape(projPoints);
            var geometry = new THREE.ShapeBufferGeometry(shape);
            // transform geometry back to the initial coordinate system
            geometry.applyMatrix(_basis);
            // add the face to the object
            var temp_face = new THREE.Mesh(geometry, material);
            object.add(temp_face);
            EdgeGeometrys.push(temp_face);
        }
        return object;
    };
})();

// Event Listener
document.addEventListener('keydown', (e) => {
    console.log(e.code);
    switch (e.code) {
        case 'KeyA':
            camera.position.x--;
            break;
        case 'KeyD':
            camera.position.x++;
            break;
        case 'KeyW':
            camera.position.y++;
            break;
        case 'KeyS':
            camera.position.y--;
            break;
        case 'KeyZ':
            camera.position.z--;
            break;
        case 'KeyX':
            camera.position.z++;
            break;

        default:
            break;
    }
});
function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    // Mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	// Mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    camera = new THREE.PerspectiveCamera(75, 4 / 3, 0.1, 1000.0);
    camera.position.z = 80;
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    controls = new OrbitControls(camera, renderer.domElement);

    var gl = renderer.getContext()
    gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)

    obj = triangulateKFacesWithShapes(points, faces);
    // scene.add(obj);

    newObj = new THREE.Object3D();
    for (let f = 0; f < frames; f++) {
        newObj.add(EdgeGeometrys[f]);
    }
    scene.add(newObj);

    window.addEventListener("resize", onWindowResize, false);
    onWindowResize();
    document.body.appendChild(renderer.domElement);

    const size = 1000;
    const divisions = 100;
    const gridHelper = new THREE.GridHelper(size, divisions);
    // scene.add(gridHelper);
    // const line_points = [vertices[21], vertices[24], vertices[26], vertices[27], vertices[28], vertices[25], vertices[23], vertices[22], vertices[21] ];

    parentTransform = new THREE.Object3D();

    const line_points = []
    console.log("ln_points:",ln_points)
    for (let pt=0;pt<ln_points.length;pt++){
        const a_line_point = []
        for(let i =0;i<ln_points[pt].length;i++)
        {
            // console.log("ln_points",ln_points[pt][i])
            a_line_point.push(vertices[ln_points[pt][i]]);
            console.log("a_line_point:",a_line_point)
        }
        // console.log("a_line_point:",a_line_point)
        line_points.push(a_line_point)
    }
    console.log("line_points:",line_points)

    // FOR RENDERING SINGLE ONE_CYCLE

    // let object;
    // let line_material = new THREE.LineBasicMaterial( { 
    //     color: 0xffffff,
    //     linewidth: 1000,
    // } );
    // let line_geometry = new THREE.BufferGeometry().setFromPoints( line_points[0] );
    // let line = new THREE.Line( line_geometry, line_material );
    // parentTransform.add(line)

    //FOR RENDERING ALL ONE_CYCLES
    for(let i=0;i<ln_points.length;i++)
    {
        let object;
        let line_material = new THREE.LineBasicMaterial( { 
            color: 0xffffff,
            linewidth: 100,
        } );
        let line_geometry = new THREE.BufferGeometry().setFromPoints( line_points[i] );
        let line = new THREE.Line( line_geometry, line_material );
        parentTransform.add(line)

    }

    scene.add(parentTransform)

    //raycasting
    
    window.addEventListener( 'pointermove', onPointerMove ); 
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let frames = 0;
let isPause = false;
let newObj = new THREE.Object3D();
let perFrameIncrement = 50;

function animate(time) {
    controls.update();

      
    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( parentTransform.children, true );
    // const intersects = raycaster.intersectObject(parentTransform)

	if(intersects.length> 0){
		intersects[0].object.material.color.setHex( 0xffffff);
        console.log('intersects')
        console.log(intersects);
	}

	renderer.render( scene, camera );

    if (!isPause) {
        if (frames * perFrameIncrement <= num_triangles) {
            scene.remove(newObj);
            newObj = new THREE.Object3D();
            if ((frames + 1) * perFrameIncrement <= num_triangles) {
                for (let f = 0; f < frames * perFrameIncrement; f++) {
                    newObj.add(EdgeGeometrys[f]);
                }
            } else {
                for (let f = 0; f < num_triangles; f++) {
                    newObj.add(EdgeGeometrys[f]);
                }
            }
            scene.add(newObj);
        }
    }

    if (frames * perFrameIncrement <= num_triangles && !isPause)
        frames++;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}