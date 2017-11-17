$(function(){
    var scoreFinal=0;

    $(".ball").on("touchstart",function(){
        $(".index").fadeOut(200);
        $(".stage").fadeIn(1000,function(){
            $(".question00-1").fadeIn(1500).fadeOut(300,function(){
                $(".question00-2").fadeIn(1500).fadeOut(300,function(){
                    $(".question-all .question01").fadeIn(300);
                });
            })
        });
    });
    $(".answer p").on("touchstart",function(){
        if($(this).html()=="汉子"){
            $(".question05-2").remove();
        }
        else if($(this).html()=="妹子"){
            $(".question05-1").remove();
        }
       $(this).parent().parent().hide();
        var score=$(this).attr("value");
        scoreFinal+=parseInt(score);
       $(this).parent().parent().next().show(1000);
       if($(this).html()=="一望无际大海边"||$(this).html()=="演唱会现场"||$(this).html()=="树林中的木屋"||$(this).html()=="温暖的下午茶餐厅"){
           $(".stage .introduce>div").fadeOut(300);
           var i=0;
           var clock=setInterval(function(){
               $(".stage .introduce>div").eq(i).siblings().fadeOut();
               $(".stage .introduce>div").eq(i).fadeIn(600);
               i++;
               if(i>7){
                   clearInterval(clock);
                   $(".stage").fadeOut();
                   $(".zhanbu").fadeIn();
               }
           },2000);
       }
    });
    $(".mingyunqian").on("touchstart",function(){
        var score=scoreFinal ;
        console.log(score);
        if(5<score&&score<=8){
            $(".result-text .zhiye").html("牧师");
            $(".result .hero-result").attr("src","images/xianzhe.png");
            document.title="我在《龙之谷》手游中适合当牧师，你呢？";
        }
        else if(8<score&&score<=12){
            $(".result-text .zhiye").html("弓箭手");
            $(".result .hero-result").attr("src","images/youxia.png");
            document.title="我在《龙之谷》手游中适合当弓箭手，你呢？";
        }
        else if(12<score&&score<=16){
            $(".result-text .zhiye").html("魔法师");
            $(".result .hero-result").attr("src","images/yuansushi.png");
            document.title="我在《龙之谷》手游中适合当魔法师，你呢？";
        }
        else if(16<score&&score<=20){
            $(".result-text .zhiye").html("战士");
            $(".result .hero-result").attr("src","images/zhanshi.png");
            document.title="我在《龙之谷》手游中适合当战士，你呢？";
        }
        $(".light").fadeIn(700).fadeOut();
        $(".result").fadeIn();
    });
    $(".share").on("touchstart",function(){
        $(".share-div").show();
    });
    $(".share-div").on("touchstart",function(){
        $(this).hide();
    })


});