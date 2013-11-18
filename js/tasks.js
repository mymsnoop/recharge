var recharge=angular.module('recharge', []);

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
};

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

recharge.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

recharge.controller('NumberCheck', ['$scope', function($scope){
    //console.log($scope);
    $scope.default_recharge=50;
    console.log(localStorage.getItem('groups'));
    console.log(localStorage.getItem('numbers'));
    $scope.groups= localStorage.getItem('groups')!=null?JSON.parse(localStorage.getItem('groups')):[{id:"8e215336-338e-f02b-acea-9ede627e6bc2",name:"august",denomination:20}
        ,{id:"95fc5688-ee70-aeba-b6d4-22716142dfc4",name:"december",denomination:10}
        ,{id:"6e8cdf4d-4429-5aa9-fa34-bcd90612381a",name:"november",denomination:30}];

    $scope.numbers=localStorage.getItem('numbers')!=null?JSON.parse(localStorage.getItem('numbers')):[{number:9899449494,group:"8e215336-338e-f02b-acea-9ede627e6bc2",status:false}
        ,{number:8826377353,group:"95fc5688-ee70-aeba-b6d4-22716142dfc4",status:true},{number:7895643256,group:"6e8cdf4d-4429-5aa9-fa34-bcd90612381a",status:true}
    ,{number:8795642658,group:"8e215336-338e-f02b-acea-9ede627e6bc2",status:false},{number:8826377353,group:"95fc5688-ee70-aeba-b6d4-22716142dfc4",status:false}
        ,{number:8826377353,group:"6e8cdf4d-4429-5aa9-fa34-bcd90612381a",status:false},{number:1256354952,group:"95fc5688-ee70-aeba-b6d4-22716142dfc4",status:true}
        ,{number:9999940132,group:"6e8cdf4d-4429-5aa9-fa34-bcd90612381a",status:true},{number:3564872146,group:"95fc5688-ee70-aeba-b6d4-22716142dfc4",status:false}];

    $scope.matrix={"Airtel":["Pay2all","egpay","Paytm"]
        ,"Vodafone":["egpay","Paytm"]
        ,"Tata":["Paytm","Beam"]
        ,"Orange":["htsm","Pay2all","egpay"]
        ,"Deutsche":["Beam","htsm"]};

    $scope.telcos=["Airtel","Vodafone","Tata","Orange","Deutsche"];

      $scope.gateways=["Debit Card","Credit Card","Netbanking","PayPal"];

    $scope.metrices={"Pay2all":{success:1,total:2},"egpay":{success:2,total:3},"Paytm":{success:4,total:9},"Beam":{success:2,total:5}
    ,"htsm":{success:1,total:5}};

    //console.log($scope.matrix["Airtel"]);
    $scope.isCorrect= function(){
        if(this.phno!=undefined && [10,12,14].indexOf(this.phno.length) !=-1)
            $scope.correct='block';
        else
            $scope.correct='none';

        return $scope.correct;
    };

    $scope.enterPress=function(num,grp){
        if(this.phno!=undefined && [10,12,14].indexOf(this.phno.length) !=-1){
        this.phno="";
        var stat= Math.random()>0.5?true:false;
        $scope.numbers.push({"number":num,group:grp.id,status:stat});
        $scope.saveState();
        }

    };

    $scope.remove=function(ele) {
        var index=$scope.numbers.indexOf(ele);
        if(index!=-1){
            $scope.numbers.splice(index,1);
        }
        console.log($scope.numbers);
        $scope.saveState();
    };

    $scope.addGroup=function() {
        $scope.groups.push({id:guid(),name:"",denomination:$scope.default_recharge});
        console.log($scope.groups);
        console.log($scope.numbers);
    };

    $scope.delete=function(grp) {
        var r = confirm("Are you sure you want to delete this group?");
        if(r){
            var index=$scope.groups.indexOf(grp);
            if(index!=-1){
                $scope.groups.splice(index,1);
            }
            var oldList=$scope.numbers;
            $scope.numbers=[];
            angular.forEach(oldList,function(element){
                element.group==grp.id?'':$scope.numbers.push(element);
            });
            $scope.saveState();
        }
    };

    $scope.moderateDenomination=function(){
        angular.forEach($scope.groups,function(ele){
           if(ele.denomination=="" || ele.denomination==null || ele.denomination==undefined)
              ele.denomination=$scope.default_recharge;
        });
    } ;

    $scope.totalValue=function(){
        var amt=0;
        var chunks={};
        angular.forEach($scope.groups,function(group){
           chunks[group.id]=group.denomination;
        });
        //console.log(chunks);
        angular.forEach($scope.numbers,function(element){
              amt+= parseInt(chunks[element.group]);
        });
        //console.log(amt);
        return amt;
    }

    $scope.variety=function(){
        $scope.moderateDenomination();
        $scope.options=[];
        var len=$scope.telcos.length;
        var found;
        console.log(len);
        angular.forEach($scope.numbers,function(element){
            var rndm= parseInt(Math.random()*len);
            var val=$scope.telcos[rndm];
            console.log(val);
            found=false;
            angular.forEach($scope.options,function(tup){
                 if(tup.name==val){
                     tup.count++;
                     found=true;
                 }
            });
            if(!found)
                $scope.options.push({name:val,count:1});
        });
        console.log($scope.options);
    }

    $scope.percentage=function(ind){
       return ($scope.metrices[ind].total!=0?(($scope.metrices[ind].success*100)/$scope.metrices[ind].total):0);
    };

    $scope.setColor=function(ind){
        var per=$scope.percentage(ind);
        var style;
        if(per<33)
            style="danger ";
        else if(per>=33 && per <66)
            style="warning";
        else
            style="success";
        return style;
    };

    $scope.canProceed=function(){
        return ($scope.numbers.length>0?true:false);
    };

    $scope.saveState=function(){
        localStorage.setItem('groups', JSON.stringify($scope.groups));
        localStorage.setItem('numbers', JSON.stringify($scope.numbers));
    };

    $scope.removeEmptyGroups=function(){
        angular.forEach($scope.groups,function(ele){
           if(ele.name=="")
                $scope.groups.splice($scope.groups.indexOf(ele),1);
        });
    };

    $scope.groupsAvl=function(){
        console.log($scope.groups.length>0?true:false);
        return ($scope.groups.length>0?'none':'block');
    };

    $scope.recharge=function(){
        var groups_history= JSON.parse(localStorage.getItem('groups_history'));
        if(groups_history!=null && groups_history.length!=0)
        {
            angular.forEach($scope.groups,function(part){
                groups_history.push(part);
            });
        }else{
            groups_history =$scope.groups;
        }

        var numbers_history= JSON.parse(localStorage.getItem('numbers_history'));
        if(numbers_history!=null && numbers_history.length!=0)
        {
            angular.forEach($scope.numbers,function(part){
                numbers_history.push(part);
            });
        }else{
            numbers_history =$scope.numbers;
        }

        localStorage.setItem('groups_history', JSON.stringify(groups_history));
        localStorage.setItem('numbers_history', JSON.stringify(numbers_history));
        console.log(localStorage.getItem('groups_history'));
        console.log(localStorage.getItem('numbers_history'));
        $scope.groups=[];
        $scope.numbers=[];
        $scope.saveState();
        location.reload();
    };

}]);

recharge.controller('History', ['$scope', function($scope){
    //console.log($scope);
    $scope.default_recharge=50;
    console.log(localStorage.getItem('groups_history'));
    console.log(localStorage.getItem('numbers_history'));
    $scope.groups=localStorage.getItem('groups_history')!=null?JSON.parse(localStorage.getItem('groups_history')):[];

    $scope.numbers=localStorage.getItem('numbers_history')!=null?JSON.parse(localStorage.getItem('numbers_history')):[];

    $scope.matrix={"Airtel":["Pay2all","egpay","Paytm"]
        ,"Vodafone":["egpay","Paytm"]
        ,"Tata":["Paytm","Beam"]
        ,"Orange":["htsm","Pay2all","egpay"]
        ,"Deutsche":["Beam","htsm"]};

    $scope.telcos=["Airtel","Vodafone","Tata","Orange","Deutsche"];

    $scope.gateways=["Debit Card","Credit Card","Netbanking","PayPal"];

    $scope.metrices={"Pay2all":{success:1,total:2},"egpay":{success:2,total:3},"Paytm":{success:4,total:9},"Beam":{success:2,total:5}
        ,"htsm":{success:1,total:3}};

    //console.log($scope.matrix["Airtel"]);
    $scope.isCorrect= function(){
        if(this.phno!=undefined && [10,12,14].indexOf(this.phno.length) !=-1)
            $scope.correct=true;
        else
            $scope.correct=false;

        return $scope.correct;
    };

    $scope.enterPress=function(num,grp){
        if($scope.isCorrect()){
            this.phno="";
            $scope.numbers.push({"number":num,group:grp.id,status:false});
        }
        //console.log($scope.numbers);

    };

    $scope.remove=function(ele) {
        var index=$scope.numbers.indexOf(ele);
        if(index!=-1){
            $scope.numbers.splice(index,1);
        }
        console.log($scope.numbers);
    };

    $scope.addGroup=function() {
        $scope.groups.push({id:$scope.groups.length+1,name:"",denomination:$scope.default_recharge});
        console.log($scope.groups);
        console.log($scope.numbers);
    };

    $scope.delete=function(grp) {
        var r = confirm("Are you sure you want to delete this group?");
        if(r){
            var index=$scope.groups.indexOf(grp);
            if(index!=-1){
                $scope.groups.splice(index,1);
            }
            var oldList=$scope.numbers;
            $scope.numbers=[];
            angular.forEach(oldList,function(element){
                element.group==grp.id?'':$scope.numbers.push(element);
            });
        }
    };

    $scope.totalValue=function(){
        var amt=0;
        var chunks={};
        angular.forEach($scope.groups,function(group){
            chunks[group.id]=group.denomination;
        });
        //console.log(chunks);
        angular.forEach($scope.numbers,function(element){
            amt+= parseInt(chunks[element.group]);
        });
        //console.log(amt);
        return amt;
    }

    $scope.variety=function(){
        $scope.options=[];
        var len=$scope.telcos.length;
        var found;
        console.log(len);
        angular.forEach($scope.numbers,function(element){
            var rndm= parseInt(Math.random()*len);
            var val=$scope.telcos[rndm];
            console.log(val);
            found=false;
            angular.forEach($scope.options,function(tup){
                if(tup.name==val){
                    tup.count++;
                    found=true;
                }
            });
            if(!found)
                $scope.options.push({name:val,count:1});
        });
        console.log($scope.options);
    }

    $scope.percentage=function(ind){
        return ($scope.metrices[ind].total!=0?(($scope.metrices[ind].success*100)/$scope.metrices[ind].total):0);
    };

    $scope.setColor=function(ind){
        var per=$scope.percentage(ind);
        var style;
        if(per<33)
            style="danger ";
        else if(per>=33 && per <66)
            style="warning";
        else
            style="success";
        return style;
    };

    $scope.recharge=function(){
        localStorage.setItem('groups_history', JSON.stringify($scope.groups));
        localStorage.setItem('numbers_history', JSON.stringify($scope.numbers));
        $scope.groups=[];
        $scope.numbers=[];
    } ;


}]);