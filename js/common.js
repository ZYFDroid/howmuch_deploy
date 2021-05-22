



function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "y+": date.getFullYear().toString(),        // 年
        "M+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "m+": date.getMinutes().toString(),         // 分
        "s+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

var NextCalc = {
    getMonthDays:function(){
        var monthdays=[31,28,31,30,31,30,31,31,30,31,30,31];
        var d = this.now();
        var year = d.getFullYear();
        var month = d.getMonth();
        var days = monthdays[month];
        if(month==1){
            if(year % 400==0){
                return days+1;
            }
            if(year % 100==0){
                return days;
            }
            if(year % 4==0){
                return days+1;
            }
        }
        return days;
    },

    saveObject:function(key,obj){
        window.localStorage.setItem(key,JSON.stringify(obj));
    },
    loadObject:function(key,defaultvalue){
        var data = window.localStorage.getItem(key);
        if(data!=null){
            try{
            return JSON.parse(data);
            }catch(e){
                console.log(e);
                return defaultvalue;
            }
        }
        return defaultvalue;
    },
    createEntry:function(date,amount,type){
        return {
            date:date,
            amount:amount,
            type:type,
        };
    },
    entrySequence:[],
    totalAmount:0,
    month:0,
    minMeal:5,

    saveState:function(){
        this.saveObject("seq",this.entrySequence);
        this.saveObject("amount",this.totalAmount);
        this.saveObject("month",this.month);
        this.saveObject("minmeal",this.minMeal)
    },
    loadState:function(){
        this.month = this.loadObject("month",this.getCurrentMonth());
        if(this.month!=this.getCurrentMonth()){
            this.clear();
            return;
        }
        this.entrySequence = this.loadObject("seq",[]);
        this.totalAmount = this.loadObject("amount",this.getDefaultBudget()) * 1;
        this.minMeal = this.loadObject("minmeal",5) * 1;
        for (let index = 0; index < this.entrySequence.length; index++) {
            const element = this.entrySequence[index];
            element.date = new Date(element.date);
            if(element.type){
            }
            else{
                element.type=0;
            }
        }
    },
    clear:function(){
        this.entrySequence=[];
        this.totalAmount=this.getDefaultBudget();
        this.month=this.getCurrentMonth();
        this.saveState();
    },
    addBudget:function(amount){
        this.totalAmount+=amount;
        this.saveState();
    },

    getWarnLevel:function(){
        if(this.computeNext()<1){
            return 2;
        }
        if(this.computeNext() - this.minMeal < 0.1){
            return 1;
        }
        return 0;
    },

    getCurrentMonth:function(){
        var d = new Date();
        return d.getFullYear() * 12 + d.getMonth();
    },
    removeBudget:function(amount){
        this.totalAmount-=amount;
        this.saveState();
    },
    addConsume:function(amount,date){
        this.entrySequence.push(this.createEntry(date,amount,0));
        this.saveState();
    },
    addOtherConsume:function(amount,date){
        this.entrySequence.push(this.createEntry(date,amount,1));
        this.saveState();
    },
    getDefaultBudget:function(){
        return this.loadObject("defm",1500);
    },
    setDefaultBudget:function(amount){
        this.saveObject("defm",amount);
    },
    now:function(){
        return new Date();
    },
    getPassedMeals:function(){
        var date = this.now();
        var count=0;
        count+=(date.getDate()-1)*3;
        if(date.getHours()>8){
            count++;
        }
        if(date.getHours()>13){
            count++;
        }
        if(date.getHours()>19){
            count++;
        }
        return count;
    },
    getEstimateMeals:function(){
        return this.getTotalMeals() - this.getPassedMeals();
    },
    getTotalMeals:function(){
        return this.getMonthDays() * 3;
    },
    getAvailableAmount:function(){
        var availableAmount = this.totalAmount;

        for (let i = 0; i < this.entrySequence.length; i++) {
            const element = this.entrySequence[i];
            availableAmount-=element.amount;
        }
        return availableAmount;
    },
    getTotalAmount:function(){
        var availableAmount = this.totalAmount;

        for (let i = 0; i < this.entrySequence.length; i++) {
            const element = this.entrySequence[i];
            if(element.type==1){
                availableAmount-=element.amount;
            }
        }
        return availableAmount;
    },
    computeNext:function(){
        var availableAmount = this.getAvailableAmount();
        
        var targetAverage = Math.min(this.minMeal,this.getTotalAmount() / this.getTotalMeals());
        var targetAmount = targetAverage * this.getEstimateMeals();
        if(targetAmount > availableAmount){
            
            var adjustedAmount = (targetAmount - availableAmount) / (this.getEstimateMeals()/5);
            var actualAmount = targetAverage - adjustedAmount-1;
            
            if(availableAmount < this.minMeal){
                return 0;
            }
            if(actualAmount<this.minMeal){
                return this.minMeal;
            }
            
            return actualAmount;
        }
        else{
            var adjustedAmount = ( availableAmount - targetAmount ) / this.getEstimateMeals();
            var actualAmount = targetAverage + adjustedAmount;
            if(availableAmount < this.minMeal){
                return 0;
            }
            if(actualAmount<this.minMeal){
                return this.minMeal;
            }
            return actualAmount;
        }
    },
    formatNumber:function(n){
        if(isNaN(n) || !isFinite(n)){
            return "N/A";
        }
        var num = Math.round(n * 100);
        var digit = Math.floor(num/100);
        var decimal = num % 100;
        var str=""+digit;
        str+=".";
        if(decimal<10){
            str+="0";
        }
        str+=decimal;
        return str;
    },

    predictNext:function (amount) {
        this.entrySequence.push(this.createEntry(date,amount));
        var result = this.computeNext();
        this.entrySequence.pop();
        return result;
    }
};
NextCalc.loadState();


if ('serviceWorker' in navigator) {           
    navigator.serviceWorker.register('/service-worker.js', {scope: '/'}).then(function (registration) {
      // 注册成功
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function (err) {                   
        // 注册失败 :(
        console.log('ServiceWorker registration failed: ', err);
    });
}