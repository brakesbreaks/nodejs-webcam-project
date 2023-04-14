let app = angular.module("app",[]);

app.run($rootScope => {
    $rootScope.levels = ["1","2","3","4"];
    $rootScope.courses = ["BSIT","BSCS","BSCPE","ACT"]
    $rootScope.studentIdNo = 0;
    $rootScope.studentImgPath = '';
    $rootScope.userId = 0;
    $rootScope.username = '';
    $rootScope.password = '';
    $rootScope.firstname = '';
    $rootScope.lastname = '';
    $rootScope.course = '';
    $rootScope.level = '';
})

app.controller("studentList",($scope,$http,$rootScope) => {
    $scope.header=["idno","lastname","firstname","course","level","action"];
    $http.get("/student").then(response => {
        $scope.students=response.data;
        if(response.data.length === 0) $scope.setDisplay = {"display":"none"}
        else $scope.setDisplay = {"display":"block"}
    });
    $scope.remove = idno => $http.delete(`/student/${idno}`).then(() => location.reload())
    $scope.updateStudent = (idno,imagepath,firstname,lastname,course,level) => {
        $rootScope.studentIdNo = idno;
        $rootScope.studentImgPath = imagepath;
        $rootScope.firstname = firstname;
        $rootScope.lastname = lastname;
        $rootScope.course = course;
        $rootScope.level = level;
    }
})

app.controller("updateStudent",($scope,$http,$rootScope) => {
    $scope.courses = $rootScope.courses;
    $scope.levels = $rootScope.levels;
    $rootScope.$watch('studentImgPath',() => {
        $scope.idno = $rootScope.studentIdNo;
        $scope.image = $rootScope.studentImgPath;
        $scope.firstname = $rootScope.firstname;
        $scope.lastname = $rootScope.lastname;
        $scope.selectedCourse = $rootScope.course;
        $scope.selectedLevel = $rootScope.level;
    })
    $scope.updateStudent = () => {
        $http.put("/student/update",{
            idno: $rootScope.studentIdNo,
            lastname: $scope.lastname,
            firstname: $scope.firstname,
            course: $scope.selectedCourse,
            level: $scope.selectedLevel
        }).then(() => location.reload())
    }
})
let idno = document.querySelector(".idno");
let lastname = document.querySelector(".lastname"), firstname = document.querySelector(".firstname");
let course = document.querySelector(".course"), level = document.querySelector(".level");
let video = document.querySelector(".video");

Webcam.set({
    width:320,
	height:240,
	image_format:'jpeg',
	jpeg_quality:90,
    flip_horiz: true
})
Webcam.attach("#my_camera");

document.querySelector(".capture").addEventListener("click", () => Webcam.freeze())
document.querySelector(".reset").addEventListener("click", () => Webcam.unfreeze())
document.querySelector(".upload").addEventListener("click", () => {
    if(lastname.value != "" || firstname.value != ""){
        Webcam.snap(data_uri => {
            Webcam.upload(data_uri,`/student?idno=${idno.value}&lastname=${lastname.value}&firstname=${firstname.value}&course=${course.value}&level=${level.value}`,(code,image) => {
                alert("New Student Added!")
                location.reload();
            })
        })
    } else alert('Fill in the empty fields!')
})

