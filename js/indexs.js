(function () {
    /*模拟数据*/
    //页面刚加载读取本地存储的歌曲列表
    let data = localStorage.getItem('mList')?
    JSON.parse(localStorage.getItem('mList')) : [];



    let searchData = [];

    //获取元素
    let start = document.querySelector('.start');
    let next = document.querySelector('.next');
    let prev = document.querySelector('.prev');
    let audio = document.querySelector('audio');
    let nowTimeSpan = document.querySelector('.nowTime');
    let totalTimeSpan = document.querySelector('.totalTime');
    let songSinger = document.querySelector('.ctr-bars-box span');
    let logoImg = document.querySelector('.logo img');
    let ctrlBars = document.querySelector('.ctrl-bars');
    let nowBars = document.querySelector('.nowBars');
    let ctrlBtn = document.querySelector('.ctrl-btn');
    let modeBtn = document.querySelector('.mode');
    let infoEl = document.querySelector('.info');
    /*let body = document.querySelector('.body');*/
    let listBox = document.querySelector('.play-list-box ul');

    //变量
    let indexs=0;  //标识当前播放歌曲索引

    let rotateDeg = 0;//记录封面旋转角度
    let timer = null;// 保存定时器
    let modeNum = 0; //0顺序播放 1 单曲循环 2 随机播放
    let infoTimer = null;

    // 加载播放列表
    function loadPlayList(){
        if (data.length){
            let str = ''; //用来累计播放项
            //加载播放列表
            for(let i = 0; i < data.length; i++){
                str += '<li>';
                str += '<i>×</i>';
                str += '<span>'+ data[i].name +'</span>';
                str += '<span>';
                for (let j = 0; j < data[i].ar.length; j++){
                    str += data[i].ar[j].name + '  ';
                }
                str += '</span>';
                str += '</li>';
            }
            listBox.innerHTML = str;
        }
    }
    loadPlayList();


    //请求服务器
    $('.search').on('keydown',function (e) {
        if(e.keyCode === 13){
            //按下回车键
            $.ajax({
                //服务器地址
                url:'https://api.imjad.cn/cloudmusic/',
                //参数
                data:{
                    type:'search',
                    s:this.value
                },
                success:function (data) {
                    searchData = data.result.songs;
                    var str = '';
                    for(var i = 0; i< searchData.length; i++){
                        str +='<li>';
                        str +='<span class="left song">'+  searchData[i].name +'</span>';
                        str +='<span class="right singer">';
                        for(var j = 0; j < searchData[i].ar.length; j++){
                            str +=searchData[i].ar[j].name + '  ';
                        }
                        str +='</span>';
                        str +='</li>';
                    }
                    $('.searchUl').html(str);
                },
                error:function (err) {
                    console.log(err);
                }
            })
            this.value = '';
        }
    })

    //点击搜索列表
    $('.searchUl').on('click','li',function () {
        data.push(searchData[$(this).index()]);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        loadNum();
        indexs = data.length - 1;
        init();
        play();
    });

    //切换播放列表
    function getlistBox() {
        let playList = document.querySelectorAll('.play-list-box ul li');
        for(var i = 0;i < playList.length; i++ ) {
            playList[i].className = '';
        }
        playList[indexs].className = 'active';
    }

    //加载播放歌曲的数量
    function loadNum() {
        $('.play-list').html(data.length);
    }
    loadNum();

    //格式化时间
    function formateTime(time) {
        return time > 9 ? time : '0' + time;
    }

    //提示框
    function info(str) {
        infoEl.innerHTML = str;
        $(infoEl).fadeIn();
        clearInterval(infoTimer);
        infoTimer=setTimeout(function () {
            $(infoEl).fadeOut();
        },1000)
    }
    //点击播放列表
    $(listBox).on('click','li',function () {
        indexs = $(this).index();
        init();
        play();
    });

    $(listBox).on('click','i',function (e) {
        data.splice($(this).parent().index(),1);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        loadNum();
        e.stopPropagation();
    });

    //音量
    audio.volume = 0.7;
    /*audio.volume = 0;*/

    /*listBox.addEventListener('click',function (e) {
        let el = e.target;
        if(el.tagName === 'SPAN'){
            el = el.parentNode;
        }
        console.log(el);
    });*/

    //初始化播放
    function init(){
        //给audio设置播放路径
        getlistBox();
        rotateDeg = 0;
        audio.src='http://music.163.com/song/media/outer/url?id='+ data[indexs].id +'.mp3';
        let str = '';
        str +=  data[indexs].name + '-----';
        songSinger.innerHTML = str;
        for(let i = 0; i < data[indexs].ar.length; i++){
            str +=data[indexs].ar[i].name + '  ';
        }
        songSinger.innerHTML = str;
        logoImg.src = data[indexs].al.picUrl;
    }
    init();

    //取不同的随机数
    function getRanumNum() {
        let randomNum = Math.floor(Math.random() * data.length);
        if(randomNum === indexs){
            randomNum = getRanumNum();
        }
        return randomNum;
    }

    //播放音乐
    function play(){
        audio.play();
        clearInterval(timer);
        timer=setInterval(function () {
            rotateDeg++;
            logoImg.style.transform = 'rotate('+ rotateDeg +'deg)';
        },30);
        start.style.backgroundPositionY = '-165px';
}

    //播放和暂停

    start.addEventListener('click',function () {
        //检测歌曲是播放状态还是暂停
        if(audio.paused){
            play();
        }else{
            audio.pause();
            clearInterval(timer);
            start.style.backgroundPositionY = '-204px';
        }
    });
    //下一曲
    next.addEventListener('click',function () {
        clearInterval(timer);
        indexs++;
        indexs = indexs > data.length - 1 ? 0 : indexs;
        init();
        play();

    })

    //上一曲
    prev.addEventListener('click',function () {
        clearInterval(timer);
        indexs--;
        indexs = indexs < 0 ? data.length - 1 : indexs;
        init();
        play();
    })

    //切换播放模式
    modeBtn.addEventListener('click',function () {
        console.log(123);

        modeNum++;
        modeNum = modeNum > 2 ? 0 : modeNum;
        switch (modeNum) {
            case 0:
                info('顺序播放');
                modeBtn.style.backgroundPositionX = '-3px';
                modeBtn.style.backgroundPositionY = '-344px';
                break;
            case 1:
                info('单曲播放');
                modeBtn.style.backgroundPositionX = '-66px';
                modeBtn.style.backgroundPositionY = '-344px';
                break;
            case 2:
                info('随机播放');
                modeBtn.style.backgroundPositionX = '-66px';
                modeBtn.style.backgroundPositionY = '-248px';
                break;
        }
    })
    //音乐准备完成

    audio.addEventListener('canplay',function () {
        console.log(audio.duration);
        let totalTime = audio.duration;
        let totalM = parseInt(totalTime/60);
        let totalS = parseInt(totalTime%60);
        totalTimeSpan.innerHTML = formateTime(totalM) + ':' + formateTime(totalS);


    audio.addEventListener('timeupdate',function () {
        let currentTime = audio.currentTime;
        let currentM = parseInt(currentTime/60);
        let currentS = parseInt(currentTime%60);

        nowTimeSpan.innerHTML = formateTime(currentM) + ':' + formateTime(currentS);

        let barWidth = ctrlBars.clientWidth;
        let position = currentTime / totalTime * barWidth;
        nowBars.style.width = position + 'px';
        ctrlBtn.style.left = position - 8 + 'px';

        if (audio.ended){
            switch (modeNum){
                case 0://顺序播放
                    next.click();
                    break;
                case 1://单曲循环
                    init();
                    play();
                    break;
                case 2://随机播放
                    indexs = getRanumNum();
                    init();
                    play();
                    break;
            }
        }

    })
    })
    ctrlBars.addEventListener('click',function (e) {
        audio.currentTime = e.offsetX / ctrlBars.clientWidth * audio.duration;

    })

    ctrlBars.addEventListener('mosedown',function () {
        body.style.userSelect = 'none';
        window.onmouseover = function (e) {
            audio.currentTime = e.offsetX / ctrlBars.clientWidth * audio.duration;
        }
    })
    ctrlBars.addEventListener('mouseup',function () {
        window.onmouseover = null;
    })

})();