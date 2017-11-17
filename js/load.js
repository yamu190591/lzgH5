(function(){

    //预加载
    window.PreLoad = function(options){

        "use strict";

        var defaults = {
            //数据源
            source: null,
            //每次预加载的最大数据条数(一次最多预加载maxCount条记录，剩余的相隔time指定的时间后继续加载)
            maxCount: 5000,
            //是否自动加载
            isAutoLoad: false,
            //是否按照队列顺序加载
            isQueueLoad: true,
            //加载间隔时间(单位：毫秒，1000毫秒 = 1秒)，在预加载时间间隔内，按需要可通过调用方法‘load’的方式手动触发继续加载
            time: 3000,
            //可预加载的资源类型
            reg: /(\.gif|\.jpg|\.png|\.bmp|\.jpeg)$/g
        },
        _this = this;

        var setting = $.extend(true, {}, defaults, options || {}),
            //自定义事件
            customEvent = {},
            //当前已加载数据源下标
            sourceIndex = 0,
            //总共已加载数据源下标
            sourceIndexAll = 0,
            //当前已加载数据条数(超过maxCount重新清零)
            recordIndex = 0,
            //加载状态(0.未加载，表示预加载器处于空闲 1.表示正在加载，预加载器处于工作状态)
            loadStatus = 0,
            //所有数据是否已经加载完成
            isLoaded = false,
            //等待的预加载队列
            queue = [],
            //当前运行队列ID
            queueID = 0,
            //自动加载时间线程对象
            autoLoadThread = null;

        //初始化操作
        var init = function(){

            //统一数据源格式
            //数据源该控件中的格式为一个二维数组，为了方便使用者使用和对数据源的封装，对外参数的数据源可以是一维数组，也可以是二维数组
            //一维表示该数组所有数据为一组，二维一组或多组，如果为一维，这里将重新统一数据源格式，重新将这个一维的数据封装成二维的数据
            if(typeof(setting.source[0]) == 'string'){
                setting.source = [setting.source];
            }

            //是否自动加载
            if(setting.isAutoLoad){
                autoLoad();
            }
        };

        //自动加载
        var autoLoad = function(){
            loader(function(){
                if(!isLoaded){
                    autoLoadThread = window.setTimeout(autoLoad, setting.time);
                }
            });
        };

        //重置自动加载
        var resetAutoLoad = function(){
            if(autoLoadThread){
                window.clearTimeout(autoLoadThread);
                autoLoadThread = null;
                autoLoad();
            }
        };

        //加载器
        var loader = function(callBack){
            if(!isLoaded){
                var source = setting.source[sourceIndex];
                var sourceCountAll = setting.source.length;
                var sourceItemCountAll = 0;
                for(var j = 0; j<sourceCountAll; j++){
                    sourceItemCountAll += setting.source[j].length;
                }
                if(source){
                    loadStatus = 1;
                    //加载前事件
                    if(customEvent){
                        var loadBeginEvent = customEvent['onLoadBegin'];
                        if(loadBeginEvent){
                            loadBeginEvent.call(_this);
                        }
                    }

                    var i=0, len = source.length, item, sourceItemCount = 0;

                    var eachEnd = len > setting.maxCount ? setting.maxCount : len;

                    var eachSource = function(data, begin, end){

                        //资源加载操作
                        var loadHandle = function(){
                            //递增每一条数据
                            sourceItemCount++;
                            sourceIndexAll++;
                            //进度
                            var progress = sourceItemCount / end;
                            //总进度
                            var progressAll = sourceIndexAll / sourceItemCountAll;

                            //响应每条数据加载完成事件
                            if(customEvent){
                                var loadEvent = customEvent['onLoad'];
                                if(loadEvent){
                                    loadEvent.call(_this, this.src, progressAll, progress);
                                }
                            }

                            //每组加载完成
                            if(sourceItemCount >= len){
                                //每一组加载完成
                                //已加载数据源累加
                                sourceIndex++;
                                //还原加载器状态
                                loadStatus = 0;

                                //响应回调
                                if(callBack)
                                    callBack.call(_this);

                                //响应自定义事件
                                if(customEvent){
                                    //每一组数据加载完成事件
                                    var loadedEvent = customEvent['onLoaded'];
                                    if(loadedEvent){
                                        loadedEvent.call(_this);
                                    }
                                }

                                //自动读取队列中等待的预加载请求
                                var queueLength = queue.length;
                                if(queueLength){
                                    if(queueID < queueLength){
                                        var queueItem = queue[queueID];
                                        if(queueItem){
                                            queueID++;
                                            //继续执行队列中预加载请求
                                            loader(queueItem.callBack);
                                        }
                                    }else{
                                        //队列加载完成后，清空队列
                                        queue = [];
                                        queueID = 0;
                                    }
                                }

                                //所有数据加载完成
                                if(sourceIndex >= sourceCountAll){
                                    //所有数据加载完成事件
                                    if(customEvent){
                                        var loadCompleteEvent = customEvent['onLoadComplete'];
                                        if(loadCompleteEvent){
                                            loadCompleteEvent.call(_this);
                                        }
                                    }
                                    //所有数据加载完成
                                    isLoaded = true;
                                }
                            }
                        };

                        for(i = begin; i<end; i++){
                        //var IntervalThread = setInterval(function(){
                            item = data[i];
                            if(setting.reg.test(item)){
                                setting.reg.test(item);
                                var image = new Image();
                                image.src = item;
                                //资源加载成功
                                image.onload = loadHandle;
                                //资源加载出错
                                image.onerror = function(){
                                    //响应资源加载错误事件
                                    if(customEvent){
                                        var errorEvent = customEvent['onError'];
                                        if(errorEvent){
                                            var result = errorEvent.call(_this, this.src);
                                            if(result == false)
                                                return false;
                                        }
                                    }

                                    loadHandle();
                                };
                            }
                            else if(/mp3/.test(item)){
                                /mp3/.test(item)
                                var newAudio=new Audio();
                                newAudio.src=item;
                                newAudio.load();
                                loadHandle.call({src: item});
                            }
                        }
                        //}, 100);

                        //为降低预加载对浏览器性能的连续消耗，每组每次最大预加载为setting.maxCount条记录，
                        //超过这个数则延迟750毫秒(待内存得到一定的释放)后继续加载，直到将该组数据预加载完成。
                        //(记录条数不足setting.maxCount时，则不影响)
                        if(end < len){
                            eachEnd = (len - end) > setting.maxCount ? (end + setting.maxCount) : len;
                            setTimeout(function(){
                                eachSource(data, end, eachEnd);
                            }, 780);
                        }
                    };

                    eachSource(source, i, eachEnd);

                }
            }
        };

        //新增预加载数据源(在原有数据源的基础上追加)
        var addSource = function(source){
            if(source){
                var i=0, len = source.length, item, tempSource = [];
                if(len){
                    for(;i<len;i++){
                        item = source[i];
                        if(typeof(item) == 'string'){
                            tempSource.push(item);
                        }
                        else{
                            setting.source.push(item);
                            isLoaded = false;
                        }
                    }
                    if(tempSource.length){
                        setting.source.push(tempSource);
                        isLoaded = false;
                    }
                }
            }

            return _this;
        }

        init();


        //新增预加载数据源
        _this.addSource = addSource;

        //手动(调用)加载
        _this.load = function(source, callBack){
            if(typeof(source) == 'function'){
                callBack = source;
                source = null;
            }

            if(source){
                addSource(source);
            }

            var tempCallBack = function(){
                //是否自动加载
                if(setting.isAutoLoad){
                    //重置自动加载
                    resetAutoLoad();
                }
                if(callBack){
                    callBack.call(_this);
                }
            };


            //是否自动加载
            if(setting.isAutoLoad){
                if(autoLoadThread){
                    //清除自动加载线程
                    window.clearTimeout(autoLoadThread);
                    autoLoadThread = null;
                }
            }

            if(loadStatus && setting.isQueueLoad){
                //预加载器正在工作状态，将新的预加载请求放入等待队列中
                queue = queue || [];
                queue.push({callBack: tempCallBack});
            }
            else{
                loader(tempCallBack);
            }
        };

        //(每一组数据)加载前事件
        _this.onLoadBegin = function(fun){
            if(fun){
                customEvent = customEvent || {};
                customEvent['onLoadBegin'] = fun;
            }

            return _this;
        };

        //每一条数据加载完成
        _this.onLoad = function(fun){
            if(fun){
                customEvent = customEvent || {};
                customEvent['onLoad'] = fun;
            }

            return _this;
        };

        //数据加载出错事件
        _this.onError = function(fun){
            if(fun){
                customEvent = customEvent || {};
                customEvent['onError'] = fun;
            }

            return _this;
        };

        //(每一组数据)加载完事件
        _this.onLoaded = function(fun){
            if(fun){
                customEvent = customEvent || {};
                customEvent['onLoaded'] = fun;
            }

            return _this;
        };

        //所有数据加载完成后事件
        _this.onLoadComplete = function(fun){
            if(fun){
                customEvent = customEvent || {};
                customEvent['onLoadComplete'] = fun;
            }
            return _this;
        };
    };
})();

// var VideoPic 

var VideoFrame = [   
    [
		"images/loader.png",
        "images/loading.png",
		"images/loading-bg.jpg"

	]
];
var VideoFrame1 = [
    [
		"images/answer-bar.jpg",
		"images/ball.png",
		"images/ball-small.png",
		"images/down-button.jpg",
		"images/girl.png",
		"images/hero-1.png",
		"images/heros.png",
		"images/index-text.png",
		"images/jianshen.png",
		"images/jiansheng.png",
		"images/jisi.png",
		"images/kuang-bg.png",
		"images/kuang-result.png",
		"images/icon_up.png",
		"images/icon_up.png",
		"images/login.jpg",
		"images/logo.png",
		"images/mingyunqian.png",
		"images/modaoshi.png",
		"images/share-button.jpg",
		"images/xianzhe.png",
		"images/youxia.png",
		"images/yuansushi.png",
		"images/zhanshi.png",
		"images/龙之谷-3.jpg",
		"images/龙之谷H5-1.jpg",
		"images/龙之谷H5-2.jpg",
		"images/龙之谷H5-4.jpg",
		"images/龙之谷H5-5.jpg"

    ]
];

var iload=new PreLoad({
	//数据源
    source: VideoFrame,
    //是否自动加载
    isAutoLoad: true	
});


var pload = new PreLoad({
    //数据源
    source: VideoFrame1,
    //是否自动加载
    isAutoLoad: true
});


//单条记录加载完成
pload.onLoad(function(item,progressAll, progress){
    console.log(item);
    var progressAllnum = progressAll * 100;
    if(progressAllnum<=10){
        $(".loading .col-box").css("top","6.5rem");
        $(".loading .loading-percent").html("10%");
    }else if(progressAllnum<=20){
        $(".loading .col-box").css("top","6rem");
        $(".loading .loading-percent").html("20%");
    }else if(progressAllnum<=30){
        $(".loading .col-box").css("top","5.5rem");
        $(".loading .loading-percent").html("30%");
    }else if(progressAllnum<=40){
        $(".loading .col-box").css("top","5rem");
        $(".loading .loading-percent").html("40%");
    }else if(progressAllnum<=50){
        $(".loading .col-box").css("top","4.5rem");
        $(".loading .loading-percent").html("50%");
    }else if(progressAllnum<=60){
        $(".loading .col-box").css("top","4rem");
        $(".loading .loading-percent").html("60%");
    }else if(progressAllnum<=70){
        $(".loading .col-box").css("top","3.5rem");
        $(".loading .loading-percent").html("70%");
    }else if(progressAllnum<=80){
        $(".loading .col-box").css("top","3rem");
        $(".loading .loading-percent").html("80%");
    }else if(progressAllnum<=90){
        $(".loading .col-box").css("top","2.5rem");
        $(".loading .loading-percent").html("90%");
    }else if(progressAllnum<=100){
        $(".loading .col-box").css("top","2rem");
        $(".loading .loading-percent").html("100%");
    }
    //pload.load();
});

//单组数据加载完成
iload.onLoaded(function(){
    $('.col-box').show();
	pload.load();
});

//所有数据加载完成
pload.onLoadComplete(function(){
    console.log('load complete');  

		$('.loading').hide();
        $('.wrap').show();

});
