/**
 * calendar - jQuery solar and lunar calendar
 *
 */
(function ($) {
	
	/*****************************************************************************
	日期资料
	 *****************************************************************************/
	var ttime = 0;
	var detail;
	var hideTimer;
	var Today = new Date();
	var tY = Today.getFullYear();
	var tM = Today.getMonth();
	var tD = Today.getDate();
	
	/* 
	1900--2049的阴历月份如下：
		20-17 16-12 12-9 8-5 4-1
		
		1-4: 表示当年有无闰年，有的话，为闰月的月份，没有的话，为0。
		5-16：为除了闰月外的正常月份是大月还是小月，1为30天，0为29天。
            注意：从1月到12月对应的是第16位到第5位（12位）。
		17-20： 表示闰月是大月还是小月，仅当存在闰月的情况下有意义。 
	*/
	var tInfo = new Array(
			0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
			0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
			0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
			0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
			0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
			0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
			0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
			0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
			0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
			0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
			0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
			0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
			0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
			0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
			0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
			0x14b63);
	
	var solarMonth = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	var Gan = new Array("甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸");
	var Zhi = new Array("子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥");
	var Animals = new Array("鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪");
	var solarTerm = new Array("小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至");
	var sTermInfo = new Array(0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758);
	var nStr1 = new Array('日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十');
	var nStr2 = new Array('初', '十', '廿', '卅', '□');
	var monthName = new Array("正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月");
	
	//国历节日 *表示放假日
	var sFtv = new Array(
			"0101*元旦节",
			"0202 世界湿地日",
			"0210 国际气象节",
			"0214 情人节",
			"0301 国际海豹日",
			"0303 全国爱耳日",
			"0305 学雷锋纪念日",
			"0308 妇女节",
			"0312 植树节 孙中山逝世纪念日",
			"0314 国际警察日",
			"0315 消费者权益日",
			"0317 中国国医节 国际航海日",
			"0321 世界森林日 消除种族歧视国际日 世界儿歌日",
			"0322 世界水日",
			"0323 世界气象日",
			"0324 世界防治结核病日",
			"0325 全国中小学生安全教育日",
			"0330 巴勒斯坦国土日",
			"0401 愚人节 全国爱国卫生运动月(四月) 税收宣传月(四月)",
			"0407 世界卫生日",
			"0422 世界地球日",
			"0423 世界图书和版权日",
			"0424 亚非新闻工作者日",
			"0501*劳动节",
			"0504 青年节",
			"0505 碘缺乏病防治日",
			"0508 世界红十字日",
			"0512 国际护士节",
			"0515 国际家庭日",
			"0517 国际电信日",
			"0518 国际博物馆日",
			"0520 全国学生营养日",
			"0523 国际牛奶日",
			"0531 世界无烟日",
			"0601 国际儿童节",
			"0605 世界环境保护日",
			"0606 全国爱眼日",
			"0617 防治荒漠化和干旱日",
			"0623 国际奥林匹克日",
			"0625 全国土地日",
			"0626 国际禁毒日",
			"0701 香港回归纪念日 中共诞辰 世界建筑日",
			"0702 国际体育记者日",
			"0707 抗日战争纪念日",
			"0711 世界人口日",
			"0730 非洲妇女日",
			"0801 建军节",
			"0808 中国男子节(爸爸节)",
			"0815 抗日战争胜利纪念",
			"0908 国际扫盲日 国际新闻工作者日",
			"0909 毛泽东逝世纪念",
			"0910 中国教师节",
			"0914 世界清洁地球日",
			"0916 国际臭氧层保护日",
			"0918 九·一八事变纪念日",
			"0920 国际爱牙日",
			"0927 世界旅游日",
			"0928 孔子诞辰",
			"1001*国庆节 世界音乐日 国际老人节",
			"1002*国庆节假日 国际和平与民主自由斗争日",
			"1003*国庆节假日",
			"1004 世界动物日",
			"1006 老人节",
			"1008 全国高血压日 世界视觉日",
			"1009 世界邮政日 万国邮联日",
			"1010 辛亥革命纪念日 世界精神卫生日",
			"1013 世界保健日 国际教师节",
			"1014 世界标准日",
			"1015 国际盲人节(白手杖节)",
			"1016 世界粮食日",
			"1017 世界消除贫困日",
			"1022 世界传统医药日",
			"1024 联合国日",
			"1031 世界勤俭日",
			"1107 十月社会主义革命纪念日",
			"1108 中国记者日",
			"1109 全国消防安全宣传教育日",
			"1110 世界青年节",
			"1111 国际科学与和平周(本日所属的一周)",
			"1112 孙中山诞辰纪念日",
			"1114 世界糖尿病日",
			"1117 国际大学生节 世界学生节",
			"1120*彝族年",
			"1121*彝族年 世界问候日 世界电视日",
			"1122*彝族年",
			"1129 国际声援巴勒斯坦人民国际日",
			"1201 世界艾滋病日",
			"1203 世界残疾人日",
			"1205 国际经济和社会发展志愿人员日",
			"1208 国际儿童电视日",
			"1209 世界足球日",
			"1210 世界人权日",
			"1212 西安事变纪念日",
			"1213 南京大屠杀(1937年)纪念日！谨记血泪史！",
			"1220 澳门回归纪念",
			"1221 国际篮球日",
			"1224 平安夜",
			"1225 圣诞节",
			"1226 毛泽东诞辰纪念");
		
		//农历节日 *表示放假日
		var lFtv = new Array(
			"0101*春节",
			"0102*初二",
			"0115 元宵节",
			"0505*端午节",
			"0707 七夕情人节",
			"0715 中元节",
			"0815*中秋节",
			"0909 重阳节",
			"1208 腊八节",
			"1223 小年",
			"0100*除夕");
		
		//某月的第几个星期几
		var wFtv = new Array(
			"0150 世界麻风日", //一月的最后一个星期日（月倒数第一个星期日）
			"0520 国际母亲节",
			"0530 全国助残日",
			"0630 父亲节",
			"0730 被奴役国家周",
			"0932 国际和平日",
			"0940 国际聋人节 世界儿童日",
			"0950 世界海事日",
			"1011 国际住房日",
			"1013 国际减轻自然灾害日(减灾日)",
			"1144 感恩节");
		
		/*****************************************************************************
		日期计算
		 *****************************************************************************/
		
		//====================================== 返回农历 y年的总天数
	function lYearDays(y) {
		var i,
		sum = 348;
		for (i = 0x8000; i > 0x8; i >>= 1)
			sum += (tInfo[y - 1900] & i) ? 1 : 0;
		return (sum + leapDays(y));
	}
	
	//====================================== 返回农历 y年闰月的天数
	function leapDays(y) {
		if (leapMonth(y))
			return ((tInfo[y - 1900] & 0x10000) ? 30 : 29);
		else
			return (0);
	}
	
	//====================================== 返回农历 y年闰哪个月 1-12 , 没闰返回 0
	function leapMonth(y) {
		return (tInfo[y - 1900] & 0xf);
	}
	
	//====================================== 返回农历 y年m月的总天数
	function monthDays(y, m) {
		return ((tInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
	}
	
	//====================================== 算出农历, 传入日期控件, 返回农历日期控件
	//                                       该控件属性有 .year .month .day .isLeap
	function Lunar(objDate) {
		
		var i,
		leap = 0,
		temp = 0;
		var offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 86400000;
		
		for (i = 1900; i < 2050 && offset > 0; i++) {
			temp = lYearDays(i);
			offset -= temp;
		}
		
		if (offset < 0) {
			offset += temp;
			i--;
		}
		
		this.year = i;
		
		leap = leapMonth(i); //闰哪个月
		this.isLeap = false;
		
		for (i = 1; i < 13 && offset > 0; i++) {
			//闰月
			if (leap > 0 && i == (leap + 1) && this.isLeap == false) {
				--i;
				this.isLeap = true;
				temp = leapDays(this.year);
			} else {
				temp = monthDays(this.year, i);
			}
			
			//解除闰月
			if (this.isLeap == true && i == (leap + 1))
				this.isLeap = false;
			
			offset -= temp;
		}
		
		if (offset == 0 && leap > 0 && i == leap + 1)
			if (this.isLeap) {
				this.isLeap = false;
			} else {
				this.isLeap = true;
				--i;
			}
		
		if (offset < 0) {
			offset += temp;
			--i;
		}
		
		this.month = i;
		this.day = offset + 1;
	}
	
	//==============================返回公历 y年某m+1月的天数
	function solarDays(y, m) {
		if (m == 1)
			return (((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
		else
			return (solarMonth[m]);
	}
	//============================== 传入 offset 返回干支, 0=甲子
	function cyclical(num) {
		return (Gan[num % 10] + Zhi[num % 12]);
	}
	
	//============================== 阴历属性
	function calElement(sYear, sMonth, sDay, week, lYear, lMonth, lDay, isLeap, cYear, cMonth, cDay) {
		
		this.isToday = false;
		//阳历
		this.sYear = sYear; //公元年4位数字
		this.sMonth = sMonth; //公元月数字
		this.sDay = sDay; //公元日数字
		this.week = week; //星期, 1个中文
		//农历
		this.lYear = lYear; //公元年4位数字
		this.lMonth = lMonth; //农历月数字
		this.lDay = lDay; //农历日数字
		this.isLeap = isLeap; //是否为农历闰月?
		//八字
		this.cYear = cYear; //年柱, 2个中文
		this.cMonth = cMonth; //月柱, 2个中文
		this.cDay = cDay; //日柱, 2个中文
		
		this.color = '';
		
		this.lunarFestival = ''; //农历节日
		this.solarFestival = ''; //公历节日
		this.solarTerms = ''; //节气
	}
	
	//===== 某年的第n个节气为几日(从0小寒起算)
	function sTerm(y, n) {
		if (y == 2009 && n == 2) {
			sTermInfo[n] = 43467
		}
		var offDate = new Date((31556925974.7 * (y - 1900) + sTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
		return (offDate.getUTCDate());
	}
	
	//============================== 返回阴历控件 (y年,m+1月)
	/*
	功能说明: 返回整个月的日期资料控件
	
	使用方式: OBJ = new calendar(年,零起算月);
	
	OBJ.length      返回当月最大日
	OBJ.firstWeek   返回当月一日星期
	
	由 OBJ[日期].属性名称 即可取得各项值
	
	OBJ[日期].isToday  返回是否为今日 true 或 false
	
	其他 OBJ[日期] 属性参见 calElement() 中的注解
	 */
	function Calendar(y, m) {
		
		var sDObj,
		lDObj,
		lY,
		lM,
		lD = 1,
		lL,
		lX = 0,
		tmp1,
		tmp2,
		tmp3;
		var cY,
		cM,
		cD; //年柱,月柱,日柱
		var lDPOS = new Array(3);
		var n = 0;
		var firstLM = 0;
		
		sDObj = new Date(y, m, 1, 0, 0, 0, 0); //当月一日日期
		
		this.length = solarDays(y, m); //公历当月天数
		this.firstWeek = sDObj.getDay(); //公历当月1日星期几
		
		////////年柱 1900年立春后为庚子年(60进制36)
		if (m < 2)
			cY = cyclical(y - 1900 + 36 - 1);
		else
			cY = cyclical(y - 1900 + 36);
		
		var term2 = sTerm(y, 2); //立春日期
		
		////////月柱 1900年1月小寒以前为 丙子月(60进制12)
		var firstNode = sTerm(y, m * 2) //返回当月「节」为几日开始
			cM = cyclical((y - 1900) * 12 + m + 12);
		
		//当月一日与 1900/1/1 相差天数
		//1900/1/1与 1970/1/1 相差25567日, 1900/1/1 日柱为甲戌日(60进制10)
		var dayCyclical = Date.UTC(y, m, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;
		
		for (var i = 0; i < this.length; i++) {
			
			if (lD > lX) {
				sDObj = new Date(y, m, i + 1); //当月一日日期
				lDObj = new Lunar(sDObj); //农历
				lY = lDObj.year; //农历年
				lM = lDObj.month; //农历月
				lD = lDObj.day; //农历日
				lL = lDObj.isLeap; //农历是否闰月
				lX = lL ? leapDays(lY) : monthDays(lY, lM); //农历当月最后一天
				
				if (n == 0)
					firstLM = lM;
				lDPOS[n++] = i - lD + 1;
			}
			
			//依节气调整二月分的年柱, 以立春为界
			/*
			//PM提出线上2月3日，初一不是庚寅年，应该是辛卯年。
			by yuji
			
			这里firstNode是指农历每月的节气所在的日期，用这个标志判断
			农历每月起始日天干地支是错误的，应当用每月的农历初一所在日确定
			下月的天干地支。农历每月初一都要重新计算一下天干地支。
			 */
			if (m == 1 && ((i + 1) == term2 || lD == 1))
				cY = cyclical(y - 1900 + 36);
			
			//依节气月柱, 以「节」为界
			//if((i+1)==firstNode) cM = cyclical((y-1900)*12+m+13);
			
			/*
			by yuji
			
			这里firstNode是指农历每月的节气所在的日期，用这个标志判断
			农历每月起始日天干地支是错误的，应当用每月的农历初一所在日确定
			下月的天干地支。农历每月初一都要重新计算一下天干地支。
			 */
			if (lD == 1) {
				cM = cyclical((y - 1900) * 12 + m + 13);
				
			}
			
			//日柱
			cD = cyclical(dayCyclical + i);
			
			//sYear,sMonth,sDay,week,
			//lYear,lMonth,lDay,isLeap,
			//cYear,cMonth,cDay
			this[i] = new calElement(y, m + 1, i + 1, nStr1[(i + this.firstWeek) % 7],
					lY, lM, lD++, lL,
					cY, cM, cD);
		}
		
		//节气
		tmp1 = sTerm(y, m * 2) - 1;
		tmp2 = sTerm(y, m * 2 + 1) - 1;
		this[tmp1].solarTerms = solarTerm[m * 2];
		this[tmp2].solarTerms = solarTerm[m * 2 + 1];
		//guohao
		if (y == 2009 && m == 1) {
			if (tD == 3) {
				this[tmp1].solarTerms = ''
					//this[tmp2].solarTerms = ''
			} else if (tD == 4) {
				this[tmp1].solarTerms = '立春'
					//this[tmp2].solarTerms = ''
			}
		}
		if (m == 3)
			this[tmp1].color = 'red'; //清明颜色
		
		//公历节日
		for (var i = 0; i < sFtv.length; i++) {
			if (sFtv[i].match(/^(\d{2})(\d{2})([\s\*])(.+)$/)){
				if (Number(RegExp.$1) == (m + 1)) {
					this[Number(RegExp.$2) - 1].solarFestival += RegExp.$4 + ' ';
					if (RegExp.$3 == '*') {
						this[Number(RegExp.$2) - 1].color = 'red';
					}
				}
			}
		}
			
		//月周节日
		for (var i = 0; i < wFtv.length; i++) {
			if (wFtv[i].match(/^(\d{2})(\d)(\d)([\s\*])(.+)$/)) {
				if (Number(RegExp.$1) == (m + 1)) {
					tmp1 = Number(RegExp.$2);
					tmp2 = Number(RegExp.$3);
					if (tmp1 < 5) {
						this[((this.firstWeek > tmp2) ? 7 : 0) + 7 * (tmp1 - 1) + tmp2 - this.firstWeek].solarFestival += RegExp.$5 + ' ';					
					} else {
						tmp1 -= 5;
						tmp3 = (this.firstWeek + this.length - 1) % 7; //当月最后一天星期?
						this[this.length - tmp3 - 7 * tmp1 + tmp2 - (tmp2 > tmp3 ? 7 : 0) - 1].solarFestival += RegExp.$5 + ' ';
					}
				}
			}
		}
			
		
		//农历节日
		for (var i = 0; i < lFtv.length; i++) {
			if (lFtv[i].match(/^(\d{2})(.{2})([\s\*])(.+)$/)) {
				tmp1 = Number(RegExp.$1) - firstLM;
				if (tmp1 == -11) {
					tmp1 = 1;
				}
				if (tmp1 >= 0 && tmp1 < n) {
					tmp2 = lDPOS[tmp1] + Number(RegExp.$2) - 1;
					if (tmp2 >= 0 && tmp2 < this.length && this[tmp2].isLeap != true) {
						this[tmp2].lunarFestival += RegExp.$4 + ' ';
						if (RegExp.$3 == '*') {
							this[tmp2].color = 'red';						
						}
					}
				}
			}
		}
		
		//复活节只出现在3或4月
		if (m == 2 || m == 3) {
			var estDay = new easter(y);
			if (m == estDay.m)
				this[estDay.d - 1].solarFestival = this[estDay.d - 1].solarFestival + ' 复活节 Easter Sunday';
		}
		
		if (m == 2)
			this[20].solarFestival = this[20].solarFestival + unescape('%20%u6D35%u8CE2%u751F%u65E5');
		
		//黑色星期五
		if ((this.firstWeek + 12) % 7 == 5)
			this[12].solarFestival += '黑色星期五';
		
		//今日
		if (y == tY && m == tM)
			this[tD - 1].isToday = true;
	}
	
	//======================================= 返回该年的复活节(春分后第一次满月周后的第一主日)
	function easter(y) {
		
		var term2 = sTerm(y, 5); //取得春分日期
		var dayTerm2 = new Date(Date.UTC(y, 2, term2, 0, 0, 0, 0)); //取得春分的公历日期控件(春分一定出现在3月)
		var lDayTerm2 = new Lunar(dayTerm2); //取得取得春分农历
		
		if (lDayTerm2.day < 15) //取得下个月圆的相差天数
			var lMlen = 15 - lDayTerm2.day;
		else
			var lMlen = (lDayTerm2.isLeap ? leapDays(y) : monthDays(y, lDayTerm2.month)) - lDayTerm2.day + 15;
		
		//一天等于 1000*60*60*24 = 86400000 毫秒
		var l15 = new Date(dayTerm2.getTime() + 86400000 * lMlen); //求出第一次月圆为公历几日
		var dayEaster = new Date(l15.getTime() + 86400000 * (7 - l15.getUTCDay())); //求出下个周日
		
		this.m = dayEaster.getUTCMonth();
		this.d = dayEaster.getUTCDate();
		
	}
	
	//====================== 中文日期
	function cDay(d, m, dt) {
		var s;
		switch (d) {
		case 1:
			s = monthName[m - 1];
			if(dt){
				s = '初一';
			}
			break;
		case 10:
			s = '初十';
			break;
		case 20:
			s = '二十';
			break;
		case 30:
			s = '三十';
			break;
		default:
			s = nStr2[Math.floor(d / 10)];
			s += nStr1[d % 10];
		}
		return (s);
	}
	
	var detailTpl = '<div style="position: absolute;visibility: hidden;"><div></div></div>';
	var favTpl = '<font color="#000000" style="font-size:9pt;">{fav}</font>';
	
	function setSize(target) {
		var opts = $.data(target, 'fullCalendar').options;
		var t = $(target);
		if (opts.fit == true) {
			var p = t.parent();
			opts.width = p.width();
			opts.height = p.height();
		}
		var header = t.find('.jqFullCalendar-header');
		t._outerWidth(opts.width);
		t._outerHeight(opts.height);
		t.find('.jqFullCalendar-body')._outerHeight(t.height() - header._outerHeight());
	}
	
	function init(target) { //初始页面入口
		$(target).addClass('jqFullCalendar').wrapInner(
			'<div class="jqFullCalendar-header">' +
				'<div class="jqFullCalendar-prevmonth"></div>' +
				'<div class="jqFullCalendar-nextmonth"></div>' +
				'<div class="jqFullCalendar-prevyear"></div>' +
				'<div class="jqFullCalendar-nextyear"></div>' +
				'<div class="jqFullCalendar-title">' +
					'<span>Aprial 2010</span>' +
				'</div>' +
			'</div>' +
			'<div class="jqFullCalendar-body fullcalendar-body">' +
				'<div class="jqFullCalendar-menu">' +
					'<div class="jqFullCalendar-menu-year-inner">' +
						'<span class="jqFullCalendar-menu-prev"></span>' +
						'<span><input class="jqFullCalendar-menu-year" type="text"></input></span>' +
						'<span class="jqFullCalendar-menu-next"></span>' +
					'</div>' +
					'<div class="jqFullCalendar-menu-month-inner"></div>' +
				'</div>' +
			'</div>');
		detail = $('div.fullcalendar-detail'); //detail for tips
		if (!detail.length) {
			detail = $('<div class="fullcalendar-detail"/>').appendTo('body');
			detail.hover(function () {
				clearTimeout(hideTimer);
			}, function () {
				$(this).hide();
			});
		}
		
		$(target).find('.jqFullCalendar-title span').hover( // 选择月份及输入年份
			function () {
			$(this).addClass('jqFullCalendar-menu-hover');
		},function () {
			$(this).removeClass('jqFullCalendar-menu-hover');
		}).click(function () {
			var menu = $(target).find('.jqFullCalendar-menu');
			if (menu.is(':visible')) {
				menu.hide();
			} else {
				showSelectMenus(target);
			}
		});
		
		$('.jqFullCalendar-prevmonth,.jqFullCalendar-nextmonth,.jqFullCalendar-prevyear,.jqFullCalendar-nextyear', target).hover(
			function () {
			$(this).addClass('jqFullCalendar-nav-hover');
		},
			function () {
			$(this).removeClass('jqFullCalendar-nav-hover');
		});
		$(target).find('.jqFullCalendar-nextmonth').click(function () {
			showMonth(target, 1);
		});
		$(target).find('.jqFullCalendar-prevmonth').click(function () {
			showMonth(target, -1);
		});
		$(target).find('.jqFullCalendar-nextyear').click(function () {
			showYear(target, 1);
		});
		$(target).find('.jqFullCalendar-prevyear').click(function () {
			showYear(target, -1);
		});
		
		$(target).bind('_resize', function () {
			var opts = $.data(target, 'fullCalendar').options;
			if (opts.fit == true) {
				setSize(target);
			}
			return false;
		});
	}
	
	/**
	 * show the calendar corresponding to the current month.
	 */
	function showMonth(target, delta) {
		var opts = $.data(target, 'fullCalendar').options;
		opts.month += delta;
		if (opts.month > 12) {
			opts.year++;
			opts.month = 1;
		} else if (opts.month < 1) {
			opts.year--;
			opts.month = 12;
		}
		show(target);
		
		var menu = $(target).find('.jqFullCalendar-menu-month-inner');
		menu.find('td.jqFullCalendar-selected').removeClass('jqFullCalendar-selected');
		menu.find('td:eq(' + (opts.month - 1) + ')').addClass('jqFullCalendar-selected');
	}
	
	/**
	 * show the calendar corresponding to the current year.
	 */
	function showYear(target, delta) {
		var opts = $.data(target, 'fullCalendar').options;
		opts.year += delta;
		show(target);
		
		var menu = $(target).find('.jqFullCalendar-menu-year');
		menu.val(opts.year);
	}
	
	/**
	 * show the select menu that can change year or month, if the menu is not be created then create it.
	 */
	function showSelectMenus(target) {
		var opts = $.data(target, 'fullCalendar').options;
		$(target).find('.jqFullCalendar-menu').show();
		
		if ($(target).find('.jqFullCalendar-menu-month-inner').is(':empty')) {
			$(target).find('.jqFullCalendar-menu-month-inner').empty();
			var t = $('<table></table>').appendTo($(target).find('.jqFullCalendar-menu-month-inner'));
			var idx = 0;
			for (var i = 0; i < 3; i++) {
				var tr = $('<tr></tr>').appendTo(t);
				for (var j = 0; j < 4; j++) {
					$('<td class="jqFullCalendar-menu-month"></td>').html(opts.months[idx++]).attr('abbr', idx).appendTo(tr);
				}
			}
			
			$(target).find('.jqFullCalendar-menu-prev,.jqFullCalendar-menu-next').hover(
				function () {
				$(this).addClass('jqFullCalendar-menu-hover');
			},
				function () {
				$(this).removeClass('jqFullCalendar-menu-hover');
			});
			$(target).find('.jqFullCalendar-menu-next').click(function () {
				var y = $(target).find('.jqFullCalendar-menu-year');
				if (!isNaN(y.val())) {
					y.val(parseInt(y.val()) + 1);
				}
			});
			$(target).find('.jqFullCalendar-menu-prev').click(function () {
				var y = $(target).find('.jqFullCalendar-menu-year');
				if (!isNaN(y.val())) {
					y.val(parseInt(y.val() - 1));
				}
			});
			
			$(target).find('.jqFullCalendar-menu-year').keypress(function (e) {
				if (e.keyCode == 13) {
					setDate();
				}
			});
			
			$(target).find('.jqFullCalendar-menu-month').hover(
				function () {
				$(this).addClass('jqFullCalendar-menu-hover');
			},
				function () {
				$(this).removeClass('jqFullCalendar-menu-hover');
			}).click(function () {
				var menu = $(target).find('.jqFullCalendar-menu');
				menu.find('.jqFullCalendar-selected').removeClass('jqFullCalendar-selected');
				$(this).addClass('jqFullCalendar-selected');
				setDate();
			});
		}
		
		function setDate() {
			var menu = $(target).find('.jqFullCalendar-menu');
			var year = menu.find('.jqFullCalendar-menu-year').val();
			var month = menu.find('.jqFullCalendar-selected').attr('abbr');
			if (!isNaN(year)) {
				opts.year = parseInt(year);
				opts.month = parseInt(month);
				show(target);
			}
			menu.hide();
		}
		
		var body = $(target).find('.jqFullCalendar-body');
		var sele = $(target).find('.jqFullCalendar-menu');
		var seleYear = sele.find('.jqFullCalendar-menu-year-inner');
		var seleMonth = sele.find('.jqFullCalendar-menu-month-inner');
		
		seleYear.find('input').val(opts.year).focus();
		seleMonth.find('td.jqFullCalendar-selected').removeClass('jqFullCalendar-selected');
		seleMonth.find('td:eq(' + (opts.month - 1) + ')').addClass('jqFullCalendar-selected');
		
		sele._outerWidth(body._outerWidth());
		sele._outerHeight(body._outerHeight());
		seleMonth._outerHeight(sele.height() - seleYear._outerHeight());
	}
	
	/**
	 * get weeks data.
	 */
	function getWeeks(target, year, month) {
		var opts = $.data(target, 'fullCalendar').options;
		var dates = [];
		var lastDay = new Date(year, month, 0).getDate();
		for (var i = 1; i <= lastDay; i++)
			dates.push([year, month, i]);
		
		// group date by week
		var weeks = [],
		week = [];
		//		var memoDay = 0;
		var memoDay = -1;
		while (dates.length > 0) {
			var date = dates.shift();
			week.push(date);
			var day = new Date(date[0], date[1] - 1, date[2]).getDay();
			if (memoDay == day) {
				day = 0;
			} else if (day == (opts.firstDay == 0 ? 7 : opts.firstDay) - 1) {
				weeks.push(week);
				week = [];
			}
			memoDay = day;
		}
		if (week.length) {
			weeks.push(week);
		}
		
		var firstWeek = weeks[0];
		if (firstWeek.length < 7) {
			while (firstWeek.length < 7) {
				var firstDate = firstWeek[0];
				var date = new Date(firstDate[0], firstDate[1] - 1, firstDate[2] - 1);
					firstWeek.unshift([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
			}
		} else {
			var firstDate = firstWeek[0];
			var week = [];
			for (var i = 1; i <= 7; i++) {
				var date = new Date(firstDate[0], firstDate[1] - 1, firstDate[2] - i);
				week.unshift([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
			}
			weeks.unshift(week);
		}
		
		var lastWeek = weeks[weeks.length - 1];
		while (lastWeek.length < 7) {
			var lastDate = lastWeek[lastWeek.length - 1];
			var date = new Date(lastDate[0], lastDate[1] - 1, lastDate[2] + 1);
			lastWeek.push([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
		}
		if (weeks.length < 6) {
			var lastDate = lastWeek[lastWeek.length - 1];
			var week = [];
			for (var i = 1; i <= 7; i++) {
				var date = new Date(lastDate[0], lastDate[1] - 1, lastDate[2] + i);
				week.push([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
			}
			weeks.push(week);
		}
		
		return weeks;
	}
	/**
	 * show the calendar day.
	 */
	function show(target) {
		var opts = $.data(target, 'fullCalendar').options;
		if (opts.year > 1874 && opts.year < 1909)
			yDisplay = '光绪' + (((opts.year - 1874) == 1) ? '元' : opts.year - 1874);
		if (opts.year > 1908 && opts.year < 1912)
			yDisplay = '宣统' + (((opts.year - 1908) == 1) ? '元' : opts.year - 1908);
		
		if (opts.year > 1911)
			yDisplay = '建国' + (((opts.year - 1949) == 1) ? '元' : opts.year - 1949);
		
		var spanTitle = opts.months[opts.month - 1] + ' ' + opts.year + ' ' + yDisplay + '年 农历 ' + cyclical(opts.year - 1900 + 36) + '年 【' + Animals[(opts.year - 4) % 12] + '年】';
		$(target).find('.jqFullCalendar-title span').html(spanTitle);
		
		var body = $(target).find('div.jqFullCalendar-body');
		body.find('>table').remove();
		
		var t = $('<table cellspacing="0" cellpadding="0" border="0"><thead></thead><tbody></tbody></table>').prependTo(body);
		var tr = $('<tr class="jqFullCalendar-theader-tr"></tr>').appendTo(t.find('thead'));
		for (var i = opts.firstDay; i < opts.weeks.length; i++) {
			tr.append('<th>' + opts.weeks[i] + '</th>');
		}
		for (var i = 0; i < opts.firstDay; i++) {
			tr.append('<th>' + opts.weeks[i] + '</th>');
		}
		
		var weeks = getWeeks(target, opts.year, opts.month);
		var currentCa = new Calendar(opts.year, opts.month - 1);
		for (var i = 0; i < weeks.length; i++) {
			var week = weeks[i];
			var tr = $('<tr class="jqFullCalendar-tbody-tr"></tr>').appendTo(t.find('tbody'));
			for (var j = 0; j < week.length; j++) {
				var day = week[j];
				var dayHtml = '<font size="5" face="Arial Black">' + day[2];
				var info = null;
				if (opts.month == day[1]) {
					info = currentCa[day[2] - 1];
					if (info.color) {
						var color = 'color="' + info.color + '"';
						dayHtml = '<font size="5" face="Arial Black" ' + color + '>' + day[2];
					}
					dayHtml += '</font>';
					if (opts.lunarDay) {
						dayHtml += "<br/>";
						if (opts.solarTerms && info.solarTerms) {
							dayHtml += '<font color="limegreen">' + info.solarTerms + '</font>';
						} else {
							dayHtml += '<font size="2" style="font-size:9pt">' + cDay(info.lDay, info.lMonth) + '</font>';
						}
					}
				}
				var day = $('<td class="jqFullCalendar-day fullcalendar-day jqFullCalendar-other-month"></td>').data('info', info).attr('abbr', day[0] + ',' + day[1] + ',' + day[2]).html('<div>' + dayHtml + '</div>').appendTo(tr);
				if (info && (info.lunarFestival || info.solarFestival)) {
					day.addClass('festival');
				}
				/* day.hover(function (e) { // use delegate method to optimize
					clearTimeout(hideTimer);
					var inf = $(this).data('info');
					if (inf) {
						var ct = '<font color="#ffffff" style="font-size:9pt;">' + inf.sYear
							 + ' 年 ' + inf.sMonth + ' 月 ' + inf.sDay + ' 日<br>星期' + inf.week
							 + '<br><font color="violet">农历 ' + monthName[inf.lMonth - 1] + ' 月 ' + cDay(inf.lDay, inf.lMonth,true)
							 + ' 日</font><br><font color="yellow">' + inf.cYear + '年 ' + inf.cMonth + '月 ' + inf.cDay + '日</font></font>';
						detail.html(ct);
						detail.css(calculatePos.call(target, detail, e.currentTarget)).fadeIn();
						if (inf.lunarFestival) {
							detail.append('<div class="lunarFestival">' + inf.lunarFestival + '</div>');
						}
						if (inf.solarFestival) {
							detail.append('<div class="solarFestival">' + inf.solarFestival + '</div>');
						}
					} else {
						detail.hide();
					}
				}, function () {
					hideTimer = setTimeout(function () {
						$('div.fullcalendar-detail').hide();
					}, 500);
				}); */
			}
		}
		t.find('td[abbr^="' + opts.year + ',' + opts.month + '"]').removeClass('jqFullCalendar-other-month');
		
		var now = new Date();
		var today = now.getFullYear() + ',' + (now.getMonth() + 1) + ',' + now.getDate();
		t.find('td[abbr="' + today + '"]').addClass('jqFullCalendar-today'); // today style
		
		var currentSelected = opts.currentSelected;
		if (!opts.isMultiSelectd && opts.current) { // 选中当前的时间 watch!
			t.find('.jqFullCalendar-selected').removeClass('jqFullCalendar-selected').css('backgroundColor', '');
			t.find('.jqFullCalendar-selected div').removeClass(opts.selectedCls);
			var current = opts.current.getFullYear() + ',' + (opts.current.getMonth() + 1) + ',' + opts.current.getDate();
			t.find('td[abbr="' + current + '"]').addClass('jqFullCalendar-selected').css('backgroundColor', '#FBEC88');
			t.find('td[abbr="' + current + '"] div').addClass(opts.selectedCls);
		} else if (opts.isMultiSelectd) { // show those default selected date
			t.find('.jqFullCalendar-selected').removeClass('jqFullCalendar-selected').css('backgroundColor', '');
			t.find('.jqFullCalendar-selected div').removeClass(opts.selectedCls);
			if (opts.startup) {
				for (var key in currentSelected) {
					t.find('td[abbr="' + key + '"]').addClass('jqFullCalendar-selected').css('backgroundColor', '#FBEC88');
					t.find('td[abbr="' + key + '"] div').addClass(opts.selectedCls);
				}
			} else if (opts.defaultSelected.length > 0) {
				var defaultSelected = opts.defaultSelected, dsLength = defaultSelected.length, 
					selObj = null, selObjFirst = {}, selectedDetailArr = [], selectedDate = '', temp = null;
				for (var i = 0; i < dsLength; i ++) {
					selObj = defaultSelected[i];
					if (opts.enanbleSingleDateZone) {
						temp = selObj.split(' - ')[0]
						selObjFirst = temp.split(' ')[0];
					} else {
						selObjFirst = selObj.split(' ')[0];
					}
					selectedDetailArr = selObjFirst.split('-');
					selectedDate = selectedDetailArr[0] + ',' + (selectedDetailArr[1] - 0) + ',' + (selectedDetailArr[2] - 0); //String - 0 covert to number
					t.find('td[abbr="' + selectedDate + '"]').addClass('jqFullCalendar-selected').css('backgroundColor', '#FBEC88');
					t.find('td[abbr="' + selectedDate + '"] div').addClass(opts.selectedCls);
					
					currentSelected[selectedDate] = selObj; //set current default selected objects
				}
				opts.defaultSelectedObj = $.extend({}, currentSelected); //set default objects
			}
			opts.startup = true;
			
			if (opts.toggleDates.length > 0 && opts.toggleCls) { //设置撤销样式
				var json = {}, toggleDates = opts.toggleDates, len = toggleDates.length, temp = null, tempFirst = '', tempArr = [], tempKey = null;
				for (var i = 0; i < len; i++) {
					temp = toggleDates[i];
					tempFirst = temp.split(' ')[0];
					tempArr = tempFirst.split('-');
					tempKey = tempArr[0] + ',' + (tempArr[1] - 0) + ',' + (tempArr[2] - 0); //String - 0 covert to number
					
					t.find('td[abbr="' + tempKey + '"] div').addClass(opts.toggleCls);
					json[tempKey] = temp;
				}
				opts.toggleDatesObj = json;
			}
		}
		
		// calulate the saturday and sunday index
		var saIndex = 6 - opts.firstDay;
		var suIndex = saIndex + 1;
		if (saIndex >= 7)
			saIndex -= 7;
		if (suIndex >= 7)
			suIndex -= 7;
		t.find('tr').find('td:eq(' + saIndex + ')').addClass('jqFullCalendar-saturday');
		t.find('tr').find('td:eq(' + suIndex + ')').addClass('jqFullCalendar-sunday');
		
		if (!opts.enableClick) {// readonly style
			t.find('td').hover(
				function () {
				$(this).addClass('jqFullCalendar-hover');
			},function () {
				$(this).removeClass('jqFullCalendar-hover');
			})
			return;
		}
		
		t.find('td').hover(
			function () {
			$(this).addClass('jqFullCalendar-hover');
		},function () {
			$(this).removeClass('jqFullCalendar-hover');
		}).click(function () { //select event
			if (!opts.isMultiSelectd) {
				t.find('.jqFullCalendar-selected').removeClass('jqFullCalendar-selected').css('backgroundColor', '');
				t.find('.jqFullCalendar-selected div').removeClass(opts.selectedCls);
				$(this).addClass('jqFullCalendar-selected').css('backgroundColor', '#FBEC88');
				$('div', this).addClass(opts.selectedCls);
				
				var parts = $(this).attr('abbr').split(',');
				opts.current = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
				opts.onSelect.call(target, opts.current, this); // onSelect function invoked
				if (opts.month != parts[1]) {
					opts.year = parts[0] - 0; //parseInt
					opts.month = parts[1] - 0; //parseInt
					show(target);
				}
			} else {
				var $this = $(this);
				var abbrParts = $this.attr('abbr');
				var parts = abbrParts.split(',');
				opts.current = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
				if (opts.month != parts[1]) {
					opts.year = parts[0] - 0;
					opts.month = parts[1] - 0;
					show(target);
				} else {//在当前月份的时候才允许改变选择状态
					if (opts.enableClickInSelZone && !(opts.defaultSelectedObj[abbrParts] || opts.toggleDatesObj[abbrParts])) {
						notify('请只能在已经选择的时间范围内操作', '提示', 'warning');
						return;
					}
					if ($this.hasClass('jqFullCalendar-selected')) {
						$this.removeClass('jqFullCalendar-selected').css('backgroundColor', '');
						$('div', $this).removeClass(opts.selectedCls).addClass(opts.toggleCls);
						delete currentSelected[abbrParts];
						if (opts.enanbleSingleDateZone) {
							opts.onSelect.call(target, jsonToArray(currentSelected), this); // onSelect function invoked
						}
					} else {
						if (opts.enanbleSingleDateZone) {
							var selectedDate = abbrParts.replace(/\,/g, '-');
							//currentSelected[abbrParts] = selectedDate + ' 00:00' + ' - ' + selectedDate + ' 23:59' ;
							showDayStyleDialog(target, currentSelected, selectedDate, this); // choose day style
						} else {
							$this.addClass('jqFullCalendar-selected').css('backgroundColor', '#FBEC88');
							$('div', $this).addClass(opts.selectedCls).removeClass(opts.toggleCls);
							var currentDate = new Date();
							var timeSuffix = opts.timeSuffix ? opts.timeSuffix : (currentDate.getHours() + ':' + currentDate.getMinutes());
							var suffixTemp = opts.withTimeSelected ? (' ' + timeSuffix ) : '';
							currentSelected[abbrParts] = abbrParts.replace(/\,/g, '-') + suffixTemp;
						}
					}
				}
				
				if (!opts.enanbleSingleDateZone) {
					opts.onSelect.call(target, jsonToArray(currentSelected), this); // onSelect function invoked
				}
			}
			
		});
		opts.onChange.call(target, opts.year, opts.month); // onChange function invoked
	}
	
	function showDayStyleDialog(target, currentSelected, selectedDate, currentTarget) {
		var opts = $.data(target, 'fullCalendar').options;
		var $targetTd = $(currentTarget);
		var cfg = {
			title : '选择整天或者半天',
			width : 288,
			height : 188,
			modal : true,
			close : function (event, ui) {
				$(this).dialog('destroy').remove();
			},
			buttons : {
				'确定' : function () {
					var thiz = $(this);
					var daySelect = $('input[name="dayStyle_select"]:checked', thiz).val();
					var timeSuffix1 = ' 00:00', timeSuffix2 = ' 12:00', timeSuffix3 = ' 23:59',
						beginTime = '', endTime = '';
					if (daySelect === 'all') {
						beginTime = selectedDate + timeSuffix1;
						endTime = selectedDate + timeSuffix3;
					} else if (daySelect === 'am') {
						beginTime = selectedDate + timeSuffix1;
						endTime = selectedDate + timeSuffix2;
					} else {//pm
						beginTime = selectedDate + timeSuffix2;
						endTime = selectedDate + timeSuffix3;
					}
					currentSelected[selectedDate.replace(/\-/g, ',')] = beginTime + ' - ' + endTime;
					$targetTd.addClass('jqFullCalendar-selected').css('backgroundColor', '#FBEC88');
					$('div', $targetTd).addClass(opts.selectedCls).removeClass(opts.toggleCls);
					opts.onSelect.call(target, jsonToArray(currentSelected), currentTarget); // onSelect function invoked
					$(this).dialog('close');
				},
				'取消' : function () {
					$(this).dialog('close');
				}
			}
		};
		
		var $dialog = $('<div></div>').dialog(cfg);
		var tpl = [
			'<div class="jqFullCalender-day-select">',
				'<input type="radio" name="dayStyle_select" value="all" checked="checked"><span>整天</span>&nbsp;',
				'<input type="radio" name="dayStyle_select" value="am"><span>上半天</span>&nbsp;',
				'<input type="radio" name="dayStyle_select" value="pm"><span>下半天</span>',
				/* '<select id="dayStyle_select" class="fullcalendar-daystyle-select">',
					'<option value="all" selected="true">全部</option>',
					'<option value="am">上半天</option>',
					'<option value="pm">下半天</option>',
				'</select>', */
			'</div>'
		].join('');
		$dialog.html(tpl);
	}
	
	function notify(str, title, type, location) {
		if( !$.pnotify ) {
			alert('str');
			return;
		};
		var location = location || 'bottom-right';
		var type = type || 'info';
		var opt = {
			pnotify_title: title || '提示',
			pnotify_text: str || '',
			pnotify_addclass: location,
			pnotify_delay: 1000,
			pnotify_stack: {"dir1": "up", "dir2": "left", push: 'down'},
			pnotify_type: type
		};
		
		return $.pnotify(opt).bgiframe();
	}
	
	function calculatePos(target, currentTarget) {
		var w = $(this).width(),
		h = $(this).height();
		var x = getElementLeft(currentTarget) + currentTarget.offsetWidth,
			y = getElementTop(currentTarget);
		if (x + $(target).width() > w) {
			x = x - $(target).width() - currentTarget.offsetWidth - 9;
		}
		if (y + $(target).height() > h) {
			y = h - $(target).height() - 28;//28;
		}
		return {
			left : x,
			top : y
		};
	}
	
	function getElementLeft(element) {
		var actualLeft = element.offsetLeft;
		var current = element.offsetParent;
		while (current !== null) {
			actualLeft += current.offsetLeft;
			current = current.offsetParent;
		}
		return actualLeft;
	}
	
	function getElementTop(element) {
		var actualTop = element.offsetTop;
		var current = element.offsetParent;
		while (current !== null) {
			actualTop += current.offsetTop;
			current = current.offsetParent;
		}
		return actualTop;
	}
	
	function jsonToArray(data) {
		var arr = [];
		for (var key in data) {
			arr.push(data[key]);
		}
		return arr;
	}
	
	function arrayToJson(data) {
		var json = {}, len = data.length, temp = null, tempFirst = '', tempArr = [], tempKey = null;
		for (var i = 0; i < len; i++) {
			temp = data[i];
			tempFirst = temp.split(' ')[0];
			tempArr = tempFirst.split('-');
			tempKey = tempArr[0] + ',' + (tempArr[1] - 0) + ',' + (tempArr[2] - 0); //String - 0 covert to number
			json[tempKey] = temp;
		}
		return json;
	}
	/////////////////////////////////////code from jquery.parser.js
	/**
	 * extend plugin to set box model width
	 */
	$.fn._outerWidth = function(width){
		if (width == undefined){
			if (this[0] == window){
				return this.width() || document.body.clientWidth;
			}
			return this.outerWidth()||0;
		}
		return this.each(function(){
			if (!$.support.boxModel && $.browser.msie){
				$(this).width(width);
			} else {
				$(this).width(width - ($(this).outerWidth() - $(this).width()));
			}
		});
	};
	
	/**
	 * extend plugin to set box model height
	 */
	$.fn._outerHeight = function(height){
		if (height == undefined){
			if (this[0] == window){
				return this.height() || document.body.clientHeight;
			}
			return this.outerHeight()||0;
		}
		return this.each(function(){
			if (!$.support.boxModel && $.browser.msie){
				$(this).height(height);
			} else {
				$(this).height(height - ($(this).outerHeight() - $(this).height()));
			}
		});
	};
	
	
	/**
	 * parse options, including standard 'data-options' attribute.
	 * 
	 * calling examples:
	 * $.parser.parseOptions(target);
	 * $.parser.parseOptions(target, ['id','title','width',{fit:'boolean',border:'boolean'},{min:'number'}]);
	 */
	$.fn.parseOptions = function (target, properties) {
		var t = $(target);
		var options = {};
		
		var s = $.trim(t.attr('data-options'));
		if (s){
			var first = s.substring(0,1);
			var last = s.substring(s.length-1,1);
			if (first != '{') s = '{' + s;
			if (last != '}') s = s + '}';
			options = (new Function('return ' + s))(); //返回json object
		}
			
		if (properties){
			var opts = {};
			for(var i=0; i<properties.length; i++){
				var pp = properties[i];
				if (typeof pp == 'string'){
					if (pp == 'width' || pp == 'height' || pp == 'left' || pp == 'top'){
						opts[pp] = parseInt(target.style[pp]) || undefined;
					} else {
						opts[pp] = t.attr(pp);
					}
				} else {
					for(var name in pp){
						var type = pp[name];
						if (type == 'boolean'){
							opts[name] = t.attr(name) ? (t.attr(name) == 'true') : undefined;
						} else if (type == 'number'){
							opts[name] = t.attr(name)=='0' ? 0 : parseFloat(t.attr(name)) || undefined;
						}
					}
				}
			}
			$.extend(options, opts);
		}
		return options;
	};
	
	//////////////////////////////////////////constructor/////
	
	$.fn.fullCalendar = function (options, param) {
		if (typeof options == 'string') {
			return $.fn.fullCalendar.methods[options](this, param);
		}
		
		options = options || {};
		return this.each(function () {
			var state = $.data(this, 'fullCalendar');
			if (state) {
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'fullCalendar', {
					options : $.extend(true, {}, $.fn.fullCalendar.defaults,  $.fn.fullCalendar.parseOptions(this), options) //$.fn.calendar.defaults,
				});
				init(this);//invoke init method
			}
			var stateOptions = state.options;
			if (stateOptions.border == false) {
				$(this).addClass('jqFullCalendar-noborder');
			}
			
			$.fn.fullCalendar.methods['setFirstDate'](this, stateOptions, stateOptions.defaultSelected);
			if (stateOptions.defaultSelected.length === 0 && stateOptions.toggleDates.length > 0) {
				$.fn.fullCalendar.methods['setFirstDate'](this, stateOptions, stateOptions.toggleDates);
			}
			setSize(this);
			show(this);
			$(this).find('div.jqFullCalendar-menu').hide(); // hide the calendar menu
		});
	};
	
	$.fn.fullCalendar.methods = {
		options : function (jq) {
			return $.data(jq[0], 'fullCalendar').options;
		},
		resize : function (jq) {
			return jq.each(function () {
				setSize(this);
			});
		},
		moveTo : function (jq, date) {
			return jq.each(function () {
				$(this).fullCalendar({
					year : date.getFullYear(),
					month : date.getMonth() + 1,
					current : date
				});
			});
		},
		setFirstDate : function (jq, options, defaultSelected) { //设置显示的第一天
			if (defaultSelected.length > 0) {
				var tempDate = defaultSelected[0].split(' - ')[0];
				var firstDate = tempDate.split(' ')[0];
				firstDate = firstDate.split('-');
				options.year = firstDate[0] - 0;
				options.month = firstDate[1] - 0;
			}
		}
	};
	
	$.fn.fullCalendar.getSelectedDates = function (jq) { // 获取日历控件选中的时间
		jq = jq || this;
		return jsonToArray($.data(jq[0], 'fullCalendar').options.currentSelected);
	};
	
	$.fn.fullCalendar.setSelectedDates = function (jq, dates, toggleDates) { // 设置日历控件选中的时间
		jq = jq || this;
		toggleDates = toggleDates || []; // 其他选中日期
		var options = $.data(jq[0], 'fullCalendar').options;
		options.currentSelected = arrayToJson(dates); //默认选中日期
		options.defaultSelectedObj = $.extend({}, options.currentSelected); //set default objects
		options.toggleDates = toggleDates; 
		$.fn.fullCalendar.methods['setFirstDate'](this, options, dates);
		if (dates.length === 0 && toggleDates.length > 0) {
			$.fn.fullCalendar.methods['setFirstDate'](this, options, toggleDates);
		}
		show(jq[0]);
	};
	
	$.fn.fullCalendar.parseOptions = function (target) {
		var t = $(target);
		return $.extend({}, $.fn.parseOptions(target, [
					'width', 'height', {
						firstDay : 'number',
						fit : 'boolean',
						border : 'boolean'
					}
				]));
	};
	
	$.fn.fullCalendar.defaults = {
		width : 180,
		height : 180,
		fit : false,
		border : true,
		firstDay : 0,
		//weeks : ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
		//months : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		weeks : ['日','一','二','三','四','五','六'],
		months : ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
		year : new Date().getFullYear(),
		month : new Date().getMonth() + 1,
		current : new Date(),
		solarTerms : true, //显示二十四节气
		lunarDay : true, //显示农历
		
		isMultiSelectd : true, //默认为单选
		selectedCls : '', //选中节点的样式
		toggleCls : '', //其他样式，用来显示额外情况样式
		toggleDates : [], //其他样式默认值
		toggleDatesObj : {},//其他样式默认对象
		defaultSelected : [], //默认显示已选日期，如['2013-03-18', '2013-03-19', '2013-03-21', '2013-03-22']
		defaultSelectedObj : {}, //默认选中日期，对象
		currentSelected : {}, //显示当前选中的日期
		startup : false, // 标识是否已经初始化
		withTimeSelected : false,// 是否使用时间后缀
		timeSuffix : '', // 时间后缀格式
		enanbleSingleDateZone : false, // 是否使用一天作为一个区间
		enableClick : true,
		enableClickInSelZone : false, // 是否允许在选择区域内选择
		
		onSelect : function (date, target) {}, //选中函数
		onChange : function (year, month) {} // 变更行数
	};
	
	/* Format a date object into a string value.
	   The format can be combinations of the following:
	   d  - day of month (no leading zero)
	   dd - day of month (two digit)
	   o  - day of year (no leading zeros)
	   oo - day of year (three digit)
	   D  - day name short
	   DD - day name long
	   m  - month of year (no leading zero)
	   mm - month of year (two digit)
	   M  - month name short
	   MM - month name long
	   y  - year (two digit)
	   yy - year (four digit)
	   @ - Unix timestamp (ms since 01/01/1970)
	   ! - Windows ticks (100ns since 01/01/0001)
	   '...' - literal text
	   '' - single quote

	   @param  format    string - the desired format of the date
	   @param  date      Date - the date value to format
	   @param  settings  Object - attributes include:
	                     dayNamesShort    string[7] - abbreviated names of the days from Sunday (optional)
	                     dayNames         string[7] - names of the days from Sunday (optional)
	                     monthNamesShort  string[12] - abbreviated names of the months (optional)
	                     monthNames       string[12] - names of the months (optional)
	   @return  string - the date in the above format */
	$.fn.fullCalendar.formatDate = function (format, date, settings) {
		if (!date)
			return '';
		var _defaults = { // Default regional settings
			closeText: 'Done', // Display text for close link
			prevText: 'Prev', // Display text for previous month link
			nextText: 'Next', // Display text for next month link
			currentText: 'Today', // Display text for current month link
			monthNames: ['January','February','March','April','May','June',
				'July','August','September','October','November','December'], // Names of months for drop-down and formatting
			monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // For formatting
			dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // For formatting
			dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], // For formatting
			dayNamesMin: ['Su','Mo','Tu','We','Th','Fr','Sa'], // Column headings for days starting at Sunday
			weekHeader: 'Wk', // Column header for week of the year
			dateFormat: 'mm/dd/yy', // See format options on parseDate
			firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
			isRTL: false, // True if right-to-left language, false if left-to-right
			showMonthAfterYear: false, // True if the year select precedes month, false for month then year
			yearSuffix: '' // Additional text to append to the year in the month headers
		};
		var dayNamesShort = (settings ? settings.dayNamesShort : null) || _defaults.dayNamesShort;
		var dayNames = (settings ? settings.dayNames : null) || _defaults.dayNames;
		var monthNamesShort = (settings ? settings.monthNamesShort : null) || _defaults.monthNamesShort;
		var monthNames = (settings ? settings.monthNames : null) || _defaults.monthNames;
		// Check whether a format character is doubled
		var lookAhead = function(match) {
			var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
			if (matches)
				iFormat++;
			return matches;
		};
		// Format a number, with leading zero if necessary
		var formatNumber = function(match, value, len) {
			var num = '' + value;
			if (lookAhead(match))
				while (num.length < len)
					num = '0' + num;
			return num;
		};
		// Format a name, short or long as requested
		var formatName = function(match, value, shortNames, longNames) {
			return (lookAhead(match) ? longNames[value] : shortNames[value]);
		};
		var output = '';
		var literal = false;
		if (date)
			for (var iFormat = 0; iFormat < format.length; iFormat++) {
				if (literal)
					if (format.charAt(iFormat) == "'" && !lookAhead("'"))
						literal = false;
					else
						output += format.charAt(iFormat);
				else
					switch (format.charAt(iFormat)) {
						case 'd':
							output += formatNumber('d', date.getDate(), 2);
							break;
						case 'D':
							output += formatName('D', date.getDay(), dayNamesShort, dayNames);
							break;
						case 'o':
							output += formatNumber('o',
								Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
							break;
						case 'm':
							output += formatNumber('m', date.getMonth() + 1, 2);
							break;
						case 'M':
							output += formatName('M', date.getMonth(), monthNamesShort, monthNames);
							break;
						case 'y':
							output += (lookAhead('y') ? date.getFullYear() :
								(date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
							break;
						case '@':
							output += date.getTime();
							break;
						case '!':
							output += date.getTime() * 10000 + this._ticksTo1970;
							break;
						case "'":
							if (lookAhead("'"))
								output += "'";
							else
								literal = true;
							break;
						default:
							output += format.charAt(iFormat);
					}
			}
		return output;
	};
	
})(jQuery);