/**
 * zcore.js
 *
 * zcore.js provides a set of utilities for custom project.
 *
 * Copyright 2012-2014 zhangbiaoguang
 *
 * Released under the MIT and GPL Licenses.
 *
 * ------------------------------------------------
 *  author:  zhangbiaoguang
 *  version: 0.1.0
 */

(function (window, $) {
	var Z = {}, document = window.document;
    
    //设置请求URL及模板的上下文
	Z.CONTEXT = $('#SystemContext', document.body).html() || '/';
	Z.TEMPLATE_PATH_PREFIX = Z.CONTEXT + 'resources/template/';
	Z.URL_PREFIX = Z.CONTEXT;

	$(document).ajaxStart(function () {
		$.blockUI({
			message : '<div class="loading"><img src="resources/images/loading.gif"/><font color="black">数据加载中...</font><div>'
		});
	}).ajaxStop($.unblockUI);
	$.ajaxSetup({
		cache : false,
		error : function (request, text, err) {
			$.unblockUI();
			if (request.responseText == 'timeout') {
				var str = '登录超时，请重新登录';
				var cfg = {
					title : '提示',
					width : 300,
					height : 150,
					modal : true,
					close : function (event, ui) {
						window.location = 'login.jsp';
						$(this).dialog('destroy').remove();
					},
					buttons : {
						'确定' : function () {
							window.location = 'login.jsp';
							$(this).dialog('close');
						}
					}
				};
				$('<div>' + str + '</div>').dialog(cfg);
			} else if ('error' == text) {
				Z.msg('操作失败，请重新操作！');
			}
		}
	});
 
    //通用的设置
    var PAGESIZES = [10, 15, 20, 50, 100], 
        NOTIFY_DELAY = 1000,
        NOTIFY_LOCATIONS = {
            'top-left' : 'top-left',
            'top-right' : 'top-right',
            'bottom-left' : 'bottom-left',
            'bottom-right' : 'bottom-right'
        },
        NOTIFY_STACKS = {
            'top-left' : {dir1 : 'down', dir2 : 'left', push : 'top'},
            'top-right' : {dir1 : 'down', dir2 : 'right', push : 'top'},
            'bottom-left' : {dir1 : 'up', dir2 : 'left', push : 'down'},
            'bottom-right' : {dir1 : 'up', dir2 : 'right', push : 'down'}
        };
    $.datepicker.setDefaults({
		changeMonth : true,
		changeYear : true
	});  
	var getListUrl = function (module) {
		return (module.listUrl || module.moduleUrl) + 'list.action';
	};
	var getInsertUrl = function (module) {
		return module.moduleUrl + 'attach.action';
	};
	var getDeleteUrl = function (module) {
		return module.moduleUrl + 'remove.action';
	};
	var getUpdateUrl = function (module) {
		return module.moduleUrl + 'update.action';
	};
	var getBatchDeleteUrl = function (module) {
		return module.moduleUrl + 'batchRemove.action';
	};
	var getViewUrl = function (module) {
		return module.moduleUrl + 'show.action';
	};

    //自定义的Cache
    Z.Cache = {
		default_zone : {}
	};
	$.extend(Z.Cache, {
		get : function (key, zone) {
			var z = zone ? this[zone] : this.default_zone;
			return z ? z[key] : null;
		},
		set : function (key, value, zone) {
			var z = zone ? this[zone] : this.default_zone;
			if (!z) {
				z = this[zone] = {};
			}
			z[key] = value;
		},
		remove : function (key, zone) {
			var z = zone ? this[zone] : this.default_zone;
			if (z) {
				delete z[key];
			}
		}
	});
    
    //自定义的Ajax
	var _ajax = $.ajax;
	var io = function (opt) {
		if (!opt)
			return null;
		if (opt.url && opt.url.indexOf('/') !== 0) {
			opt.url = Z.URL_PREFIX + opt.url;
		}
		if (opt.data) {
			var d = opt.data;
			$.each(d, function (k) {
				if (!d[k] && d[k] !== false && d[k] !== 0 && d[k] !== '0') {
					delete d[k];                
                }
			});
		}
		return _ajax(opt);
	};
	$.ajax = io;

    //常用功能封装
	$.extend(Z, {
		io : io,
		ajax : io,
		_ajax : _ajax,
		get : $.get,
		post : $.post,
		del : function (url, data, callback, type) {
			if ($.isFunction(data)) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			return $.ajax({
				type : 'delete',
				url : url,
				data : data,
				success : callback,
				dataType : type
			});
		},
        
		put : function (url, data, callback, type) {
			if ($.isFunction(data)) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			return $.ajax({
				type : 'put',
				url : url,
				data : data,
				success : callback,
				dataType : type
			});
		},
        
		tpl : function (option) { //tpl是将模板和数据进行组装的Ajax请求
			var tplurl = option.tpl, before = option.before;
			if (tplurl.indexOf('/') !== 0) {
				tplurl = Z.TEMPLATE_PATH_PREFIX + tplurl;
			}
			var opt = $.extend({}, option);

			var cb = function (tpl) {
				Z.Cache.set(tplurl, tpl, 'template');
				if (!opt.url) {
					var dat = {};
					if ($.isFunction(before)) {
						dat = before(dat);
					}
					var result = Mustache.to_html(tpl, dat);
					if ($.isFunction(option.success)) {
						option.success(result, dat, {});
					}
					return;
				}
				opt['success'] = function (data) {
					var dat = $.extend({}, data);
					if ($.isFunction(before)) {
						dat = before(dat);
					}
					var result = Mustache.to_html(tpl, dat);
					if ($.isFunction(option.success)) {
						option.success(result, dat, data);
					}
				};
				if (!opt.dataType) {
					opt.dataType = 'json';
				}
				Z.io(opt);
			};

			var tpl_cache = Z.Cache.get(tplurl, 'template');
			if (tpl_cache) {
				cb(tpl_cache);
			} else {
				$.get(tplurl, null, cb, 'html');
			}
		},

		notify : function (str, title, type, location) { //通用的公告信息方法
			if (!$.pnotify) {
                return Z.msg(str, null, {title : title});
            }
			location = location || 'bottom-right';
			type = type || 'info';

			var opt = {
				pnotify_title : title || '提示',
				pnotify_text : str || '',
				pnotify_addclass : NOTIFY_LOCATIONS[location],
				pnotify_delay : NOTIFY_DELAY,
				pnotify_stack : NOTIFY_STACKS[location],
				pnotify_type : type
			};

			return $.pnotify(opt).bgiframe();
		},
        
		msg : function (str, fn, options) {
            var cfg = {
                title : '提示',
                width : 300,
                height : 150,
                modal : true,
                bgiframe : true,
                beforeClose : function () {
                    if ($.isFunction(fn)) {
                        fn();
                    }
                },
                close : function (event, ui) {
                    $(this).dialog('destroy').remove();
                },
                buttons : {
                    '关闭' : function () {
                        $(this).dialog('close');
                    }
                }
            };
            $.extend(cfg, options);
			return $('<div>' + str + '</div>').dialog(cfg);
		},
        
        confirm : function (str, fn, options) {
            var cfg = {
                title : '提示',
                width : 300,
                height : 150,
                modal : true,
                bgiframe : true,
                close : function (event, ui) {
                    $(this).dialog('destroy').remove();
                },
                buttons : {
                    '确定' : function () {
						if (fn() === false) {
							return;
						}
						$(this).dialog('close');
					}, 
                    '关闭' : function () {
                        $(this).dialog('close');
                    }
                }
            };
            $.extend(cfg, options);
			return $('<div>' + str + '</div>').dialog(cfg);
		},
        
		destroyDialog : function (dialog) {
			if (dialog) {
				$('*', dialog).remove();
			} else {
				$('.ui-dialog *').remove();
			}
		},

		getFormData : function (form) { //返回的是一个对象数组<k,v>
			if (!form) {
				form = $('form:eq(0)');
			} else if ((typeof form) === 'string' || (form.nodeType === 1 && form.nodeName.toUpperCase() === 'FORM')) {
				form = $(form);
			} else {
				form = $('form', form);
			}
			var params = form.serializeArray();
			var result = {}, pValue = null;
			for (var i = 0; i < params.length; i++) {
				pValue = params[i].value;
				pValue = pValue && (typeof pValue === 'string') ? pValue.trim() : pValue;
				result[params[i].name] = pValue;
			}
			return result;
		},

		getViewUrl : getViewUrl,
        
		isInt : function (str) {
			return /^\d+$/.test(str);
		},
        
		isFloat : function (str) {
			return /^\d+\.?\d*$/.test(str);
		},
       
		getFloatNum : function (value) { //获得带两位小数的数字
			var num = value;
			if (!Z.isFloat(value)) {
				return;
			}

			num = Math.round(num * 100) / 100; //四舍五入
			if (!Z.isInt(num)) {
				var count = 2 - ((num + '').length - (num + '').lastIndexOf('.') - 1);
				if (count == 1) {
					num = num + '0';
				}
			} else {
				num = num + '.00';
			}
			return num;
		},
		
		rounding : function (value) {//四舍五入，并保留两位小数
			return Math.round(value * Math.pow(10, 2)) / Math.pow(10, 2);
		},
        
		listObjectToArray : function (data) {
            var result = [];
            $.each(data, function (k, v) {
                result.push(v);
            });
            return result;
        },
        
        page : function (cb, ctx) { //项目的分页控件
			ctx = ctx || document.body;
			var pageInfo = {
				pageCount : 1,
				pageSize : 100,
				recordCount : 0,
				current : 1,
				ctx : ctx,
				cb : cb,
				gotoPage : function (page) {
					this.current = page;
					$('.page', $(ctx)).hide();
					this.cb(this);
				},
				extra : function (data) {
					this.extraData = data;
				},
				fill : function (data) {
					data.currentPage = this.current;
					data.pageSize = this.pageSize;
					if (this.sortName) {
						data.sortName = this.sortName;
						data.desc = this.desc;
					}
					if (this.extraData) {
						$.extend(data, this.extraData);
					}
					if (this.status) {
						data.status = this.status;
					}
					return data;
				},
				init : function (data) {
					var curPage = $('.currentPage', $(ctx)),
                        totalPages = $('.totalPages', $(ctx)),
                        totalRecords = $('.totalRecords', $(ctx));
					var jumper = $('.pageJumper', $(ctx)),
                        chooser = $('.pageSizeChooser', $(ctx));
					var st = $('.selStatus', $(ctx));
					var ths = this;

					this.pageCount = data.pageCount || 1;
					this.recordCount = data.recordCount || 0;

					curPage.text(this.current);
					totalPages.text(this.pageCount);
					totalRecords.text(this.recordCount);

					var pages = [];
					var crrrentpageNum = Number(this.current);

					if ((Number(this.pageCount)) <= 60) { // 总页码小于60，则全部展示
						for (var i = 1; i <= this.pageCount; i++) {
							pages.push('<option value="' + i + '" ' + (i == ths.current ? 'selected ' : ' ') + '>' + i + '</option>');
						}
					} else {
						if (crrrentpageNum <= 30) { // 当前页码数小于30，则展示60页
							for (var i = 1; i <= 60; i++) {
								pages.push('<option value="' + i + '" ' + (i == ths.current ? 'selected ' : ' ') + '>' + i + '</option>');
							}
						} else { // 当前页码大于30页则展示当前页码的前30条及后30条，如果页码到了最后一页则终止循环
							for (var i = crrrentpageNum - 30; i <= crrrentpageNum + 30; i++) {
								pages.push('<option value="' + i + '" ' + (i == ths.current ? 'selected ' : ' ') + '>' + i + '</option>');
								if (i == this.pageCount) {
									break;
								}
							}
						}
					}

					jumper.html(pages.join(''));
					jumper.unbind('change').change(function () {
						var val = $(this).val();
						ths.gotoPage(val);
					});

					var sizes = [];
					$.each(PAGESIZES, function (i, v) {
						sizes.push('<option value="' + v + '" ' + (v == ths.pageSize ? 'selected ' : ' ') + '>' + (v == -1 ? '全部' : v) + '</option>');
					});
					chooser.html(sizes.join(''));
					chooser.unbind('change').change(function () {
						ths.pageSize = $(this).val();
						ths.gotoPage(1);
					});

					//init head sort
					var headers = $('th[name].sortable', $(ctx));
					headers.removeClass('desc').removeClass('asc');
					if (ths.sortName) {
						$('th[name="' + ths.sortName + '"]').addClass(ths.desc ? 'desc' : 'asc');
					}
					headers.unbind('click').click(function () {
						var desc = !$(this).hasClass('desc');
						$(this).removeClass('desc').removeClass('asc').addClass(desc ? 'desc' : 'asc');
						ths.sortName = $(this).attr('name');
						ths.desc = desc;
						ths.gotoPage(1);
					});
					st.unbind('change').change(function () {
						var val = $(this).val();
						ths.status = val;
						ths.gotoPage(1);
					});

					ths.initButtons();
					$('.page', $(ctx)).show();
				},
				initButtons : function () {
					var ctx = this.ctx;
					var first = $('#firstPage', $(ctx)), prev = $('#prevPage', $(ctx)),
                        next = $('#nextPage', $(ctx)), last = $('#lastPage', $(ctx));
					var ths = this;
					first.removeClass('firstPage').addClass('false');
					prev.removeClass('prevPage').addClass('false');
					next.removeClass('nextPage').addClass('false');
					last.removeClass('lastPage').addClass('false');

					var page = this.current;
					if (this.pageCount <= 1)
						$('.false').unbind('click').click(function () {
							return false;
						});
					if (page != 1) {
						first.removeClass('false');
						first.addClass('firstPage');
						prev.removeClass('false');
						prev.addClass('prevPage');
					}
					if (page != this.pageCount) {
						last.removeClass('false');
						last.addClass('lastPage');
						next.removeClass('false');
						next.addClass('nextPage');
					}

					var fn = function (page) {
						ths.gotoPage.call(ths, page);
					};
					first.unbind('click').click(function () {
						pageInfo.current = 1;
						fn(1);
					});
					prev.unbind('click').click(function () {
						var p = parseInt(pageInfo.current, 10) - 1;
						p = (p < 1 ? 1 : p);
						fn(p);
					});
					next.unbind('click').click(function () {
						var p = parseInt(pageInfo.current, 10) + 1;
						p = (p > pageInfo.pageCount ? pageInfo.pageCount : p);
						fn(p);
					});
					last.unbind('click').click(function () {
						var p = pageInfo.pageCount;
						fn(p);
					});

					$('.false').unbind('click').click(function () {
						return false;
					});
				},
				reload : function (keepExtraData) {
					if (!keepExtraData) {
						delete this.extraData; // use for reload without search config.
					}
					this.gotoPage(this.current);
				}
			};
			pageInfo.current = 1;
			pageInfo.reload();
			return pageInfo;
		},

		initSort : function (table, fn) {
			if ($.isFunction(table)) {
				fn = table;
				table = null;
			}
			table = $(table || 'table:eq(0)');
			var ths = $('th[name].sortable');
			ths.removeClass('desc').removeClass('asc');
			Z.sortInfo = Z.sortInfo || {};
			if (Z.sortInfo.name) {
				$('th[name="' + Z.sortInfo.name + '"]').addClass(Z.sortInfo.type ? 'desc' : 'asc');
			}
			ths.click(function () {
				var desc = !$(this).hasClass('desc');
				$(this).removeClass('desc').removeClass('asc').addClass(desc ? 'desc' : 'asc');
				Z.sortInfo.name = $(this).attr('name');
				Z.sortInfo.type = desc;
				fn($(this).attr('name'), desc);
			});
		},
        
        log : function () {
            if (console.log) {
                console.log.apply(console, arguments);
            }
        }
	});
    
    //模块功能封装
    $.extend(Z, {
        defaultModule : function () {
			return {
                width : 600,
				height : 400,
                defaultRows : 15,
				formTpl : '',
				manageTpl : '',
				listTpl : '',
				moduleUrl : '',
				listUrl : '',
				searchText : '',
				contentTarget : '#content',
				listTarget : '#list',
				entityName : '',
				dataLevel : '',
				needPage : true,
				batchDelete : true,
				useLocalOperators : false,
				autoReplenish : false,
				autoBindDBClick : true,
				autoBindClick : true,
				showWithoutBlock : false,
				showWithAttachment : false,
                listSearchParams : {},
                
				getSubModules : function (me) {
					return [];
				},

				getModuleDataLevel : function (me) {
					return me.dataLevel;
				},

				init : function (me) {
					delete me.extraData;
					Z.tpl({
						tpl : me.manageTpl,
						success : function (html) {
							$(me.contentTarget).html(html);
							me.initOperators(me, $(me.contentTarget));
							if (me.needPage) {
								me.initPageList(me);
							} else {
								me.initNoPageList(me);
							}
							me.initSearchText(me);
							me.afterInit(me);
						}
					});
				},
                
				initSearchText : function (me, selector) {
					selector = selector || 'form input:eq(0)';
					var input = $(selector, $(me.contentTarget));
					$(input).val(me.searchText);
					$(input).focus(function () {
						$(input).val('');
					});
					$(input).blur(function () {
						$(input).val($(input).val() === '' || $(input).val() == null ? me.searchText.replace(/(^\s*)|(\s*$)/g, '') : $(input).val());
					});
				},
                
				afterInit : function (me, handler) {
					var contentTarget = $(me.contentTarget);
                    if (handler && typeof handler === 'function') {
                        handler.call(contentTarget);
                    }
				},
                
				beforeListData : function (me, data) {
					return data;
				},
                
				dataToRecords : function (me, data) {
					var records = {};
					$.each(data.results, function (i, v) {
						records[v.id] = v;
					});
					return records;
				},

				getRecords : function (me) {
					return me.records;
				},

				listParam : function (me, data) {
					return data;
				},

				initPageList : function (me) {
					if (me.pager) {
						delete me.pager.extraData;
						me.pager.gotoPage(1);
						return;
					}
					me.pager = Z.page(function (pager) {
                        me.listSearchParams = $.extend({dataLevel : me.dataLevel}, me.listSearchParams);
                        var data = me.listParam(me, pager.fill(listSearchParams));
                        Z.tpl({
                            tpl : me.listTpl,
                            url : getListUrl(me),
                            data : data,
                            before : function (data) {
                                me.records = me.dataToRecords(me, data);
                                return me.beforeListData(me, data);
                            },
                            success : function (html, data, orgiData) {
                                $(me.listTarget, $(me.contentTarget)).html(html);
                                pager.init(data);
                                me.afterList(me, data, orgiData);
                                me.afterListTpl(me, data, orgiData);
                            }
                        });
                    }, me.contentTarget);
				},
                
				initNoPageList : function (me) {
					me.listSearchParams = $.extend({dataLevel : me.dataLevel}, me.listSearchParams);
					var data = me.listParam(me, me.listSearchParams);
					Z.tpl({
						tpl : me.listTpl,
						url : getListUrl(me),
						data : data,
						before : function (data) {
							me.records = me.dataToRecords(me, data);
							return me.beforeListData(me, data);
						},
						success : function (html, data, orgiData) {
							$(me.listTarget, $(me.contentTarget)).html(html);
							me.afterList(me, data, orgiData);
							me.afterListTpl(me, data, orgiData);
						}
					});
				},

				afterListTpl : function (me, data, orgiData) {},

				afterList : function (me, data) {
					if (me.autoReplenish) {
						me.replenishRows(me);
					}
					if (me.autoBindDBClick) {
						me.bindTrDbClick(me);
					}
					if (me.autoBindClick) {
						me.bindTrClick(me);
					}
					me.chkRows(me, data);
					$('tbody>tr', $(me.contentTarget)).removeClass('even');
					$('tbody>tr:even', $(me.contentTarget)).addClass('even'); //偶数行变色

					var tr = $('.list_body tbody tr', $(me.contentTarget));
					tr.on('click', 'input', function (e) {
						if ('checkbox' === $(this).attr('type') || 'radio' === $(this).attr('type')) {
							$.each($('.list_body tbody tr', $(me.contentTarget)).find('input'), function (i, v) {
								if ('checkbox' === v.type || 'radio' === v.type) {
									if (v.checked) {
										v.parentNode.parentNode.style.background = '#F8F5DE';
									} else {
										v.parentNode.parentNode.style.background = '';
									}
								}
							});
						}
					});
				},
				
				bindTrClick : function (me) { // 单击选中行
					var listBody = $('.list_body tbody', $(me.contentTarget));
					listBody.on('click', 'tr', function (e) {
						var tr = $(this);
						$('.bgcolorClass_TR').removeAttr('style').removeClass('bgcolorClass_TR');
						tr.addClass('bgcolorClass_TR');
						$('.bgcolorClass_TR').css('background', '#F8F5DE');
					});
				},

				bindTrDbClick : function (me) {
					var listBody = $('.list_body tbody', $(me.contentTarget));
					listBody.on('dblclick', 'tr', function (e) {
						var tr = $(this),
						checkbox = null;
						var tbodyCheckboxs = $('input[name]:checked', listBody);
						var checkboxs = $('input[type="checkbox"]', tr);
						if (checkboxs.length !== 0) {
							checkbox = checkboxs[0];
							checkbox = $(checkbox);
							if (tbodyCheckboxs.length !== 0) {
								tbodyCheckboxs.not(checkbox).attr('checked', false);
								$.each(tbodyCheckboxs.not(checkbox), function (i, v) {
									v.parentNode.parentNode.style.background = '';
								});
							}
							checkbox.attr('checked', true);
							tr.css('background', '#F8F5DE');
							me.show(me);
						}
						return false;
					});
				},

				replenishRows : function (me, listSelector) { //补全列表
					listSelectors = listSelector || '.list_body';
					var listBody = $(listSelectors + ' tbody', $(me.contentTarget));
					var trs = $('tr', listBody), length = trs.length,
                        trHtml = '', defaultRows = me.defaultRows,
                        lastRow = '', oweNumber = 0, oweTpl = '';
					if (length < defaultRows) {
						oweNumber = defaultRows - length;
						lastRow = trs[length - 1];
						trHtml = '<tr>' + lastRow.innerHTML + '</tr>';
						for (var i = 0; i < oweNumber; i++) {
							oweTpl = oweTpl + trHtml;
						}
						listBody.append(oweTpl);
					} else { //if (length === defaultRows + 1)
						lastRow = trs[length - 1];
						$(lastRow).hide();
					}
				},

				chkRows : function (me, data) {},

				getIntNum : function (me, input) { //获取整数数字
					var value = $('input[name="' + input.name + '"]').val();
					var num = value;
					if (!Z.isFloat(value)) {
						$('input[name="' + input.name + '"]').val('');
						return;
					}
					if (!Z.isInt(value)) {
						$('input[name="' + input.name + '"]').val('');
						return;
					}
					$('input[name="' + input.name + '"]').val(Math.round(num * 100) / 100);
				},
                
				getSelectedData : function (me, id) {
					var selId = id || me.offerId(me);
					if (me.beforeEdit(me, selId) === false) {
						return;
					}
					var fetchData = false;
					try {
						fetchData = me.beforeEditData(me, selId);
					} catch (e) {}
					return fetchData;
				},
                
				checkFormData : function (me, data, type, dialog) {
					return true;
				},
                
				afterCheckForm : function (data, type) {
					return data;
				},
                
				addWindowInfo : function (me) {
					return {
						title : '新增' + me.entityName,
						width : me.width,
						height : me.height
					};
				},
                
				getFormData : function (me, dialog) {
					return Z.getFormData(dialog);
				},
                
				beforeAdd : function (me) {
					return true;
				},
                
				beforeAddData : function (me, data) {
					return null;
				},
                
				add : function (me) {
					if (me.beforeAdd(me) === false) {
                        return;
                    }						
					Z.tpl({
						tpl : me.formTpl,
						before : function (data) {
							return me.beforeAddData(me, data) || {};
						},
						success : function (html) {
							var windowInfo = me.addWindowInfo(me);
							var dialog = Z.confirm(html, function () {
                                var data = me.getFormData(me, dialog);
                                if (me.checkFormData(me, data, 'add', dialog) === false) {
                                    return false;
                                }
                                data = me.afterCheckForm(data, 'add');
                                me.doAdd(me, data, dialog);
                            }, windowInfo.title, windowInfo.width, windowInfo.height);
							me.afterAddWindow(me, dialog);
						}
					});
				},
				afterAddWindow : function (me, dialog) {},

				doAdd : function (me, data, dialog) {
					Z.post(getInsertUrl(me), data, function (result) {
						me.afterAdd(me, data, result, dialog);
					});
				},

				afterAdd : function (me, data, result, dialog) {
					if (result) {
						me.notify('新增' + me.entityName + '成功', '提示', null, 'bottom-right');
						me.refresh(me);
					} else {
						me.notify('新增' + me.entityName + '失败', '提示', null, 'bottom-right');
					}
				},

				offerId : function (me) {
					if (me.innerEditId) {
						var id = me.innerEditId;
						delete me.innerEditId;
						return id;
					}
					var checked = $('input[name]:checked', $('tbody', $(me.contentTarget)));
					if (checked.length != 1) {
						me.notify('请正确选择要操作的' + me.entityName, '提示', null, 'bottom-right');
						return;
					}
					return checked.val();
				},
                
				beforeEdit : function (me, id) {
					return !!id;
				},
                
				beforeEditData : function (me, id, data) {
					return me.records[id];
				},
                
				editWindowInfo : function (me) {
					return {
						title : '编辑' + me.entityName,
						width : me.width,
						height : me.height
					};
				},
                
				edit : function (me) {
					var id = me.offerId(me);
					if (me.beforeEdit(me, id) === false) {
                        return;
                    }

					var fetchData = false;
					try {
						fetchData = me.beforeEditData(me, id);
					} catch (e) {}

					Z.tpl({
						tpl : me.formTpl,
						url : (fetchData ? '' : getViewUrl(me) + '?id=' + id),
						before : function (data) {
							return fetchData ? fetchData : me.beforeEditData(me, id, data);
						},
						success : function (html, data, origData) {
							var windowInfo = me.editWindowInfo(me);
							var dialog = Z.confirm(html, function () {
                                var data = me.getFormData(me, dialog);
                                if (me.checkFormData(me, data, 'edit', dialog) === false) {
                                    return false;
                                }
                                data = me.afterCheckForm(data, 'edit');
                                var rbbox = $('#showText');
                                rbbox.bind('mouseover', function (event) {
                                    timeout = 'true';
                                    me.closeBox();
                                });
                                rbbox.bind('mouseout', function (event) {
                                    timeout = null;
                                    $('#rbbox').fadeOut(1500);
                                });
                                me.doEdit(me, id, data, dialog);
                            }, windowInfo.title, windowInfo.width, windowInfo.height);
							me.afterEditWindow(me, dialog, data, origData);
						}
					});
				},

				afterEditWindow : function (me, dialog, data, origData) {},

				doEdit : function (me, id, data, dialog) {
					data.id = id;
					Z.post(getUpdateUrl(me), data, function (result) {
						me.afterEdit(me, data, result, dialog);
					});
				},

				afterEdit : function (me, data, result, dialog) {
					if (result) {
						me.notify('编辑' + me.entityName + '成功', '提示', null, 'bottom-right');
						if (me.pager) {
							me.pager.reload();
						} else {
							me.init(me);
						}
					} else {
						me.notify('编辑' + me.entityName + '失败', '提示', null, 'bottom-right');
					}
				},

				innerEdit : function (me, id) {
					me.innerEditId = id;
					me.edit(me);
				},
                
				innerDel : function (me, id) {
					me.innerEditId = id;
					var ids = [];
					ids.push(id);
					if (me.beforeDel(me, ids) === false)
						return;
					Z.confirm('确定要删除选中的记录吗?', function () {
						var data = me.beforeDelData(me, ids);
						me.doDel(me, data);
					});
					return;
				},

				offerIds : function (me) {
					var checked = [];
					$('input[name]:checked', $('tbody', $(me.contentTarget))).each(function (i, v) {
						checked.push($(v).val());
					});
					if (checked.length === 0) {
						me.notify('请正确选择要操作的' + me.entityName, '提示', null, 'bottom-right');
						return;
					}
					return checked;
				},
                
				beforeDel : function (me, ids) {
					return true;
				},
                
				beforeDelData : function (me, ids) {
					return me.batchDelete ? {ids : ids} : ids;
				},
                
				selectOption : function (op, value) {
					$.each(op, function (k, v) {
						if ($(v).val() == value) {
							$(v).attr('selected', 'selected');
						}
					});
				},

				del : function (me) {
					if (me.batchDelete) {
						var ids = me.offerIds(me);
						if (!ids || ids.length === 0)
							return;
						if (me.beforeDel(me, ids) === false)
							return;
						Z.confirm('确定要删除选中的记录吗?', function () {
							var data = me.beforeDelData(me, ids);
							me.doDel(me, data);
						});
						return;
					}
					var id = me.offerId(me);
					if (!id) {
                        return;
                    }
					if (me.beforeDel(me, id) === false) {
                        return;
                    }
					Z.confirm('确定要删除选中的记录吗?', function () {
						var data = me.beforeDelData(me, id);
						me.doSingleDel(me, data);
					});
				},

				afterDel : function (me, data, result) {
					if (result && result.deleteMessage == null) {
						me.notify('删除' + me.entityName + '成功', '提示', null, 'bottom-right');
						me.refresh(me);
					} else if (result.deleteMessage == 'fail') {
						me.notify('已经使用的' + me.entityName + '不能删除', '提示', null, 'bottom-right');
					}
				},
                
				doDel : function (me, data) {
					data.id = data.ids.join(',');
					delete data.ids;
					Z.io({
						url : getBatchDeleteUrl(me),
						data : data,
						type : 'post',
						success : function (result) {
							me.afterDel(me, data, result);
						},
						error : function () {
							me.notify('已经使用的对象不能删除', '提示', null, 'bottom-right');
						}
					});
				},
                
				doSingleDel : function (me, id) {
					var data = {
						id : id
					};
					Z.post(getDeleteUrl(me), data, function (result) {
						me.afterDel(me, data, result);
					});
				},

				notify : function (str, title, type, location) {
					if (!$.pnotify) {
						return Z.msg(str, null, {title : title});
                    }
					location = location || 'bottom-right';
					type = type || 'info';

					var opt = {
						pnotify_title : title || '提示',
						pnotify_text : str || '',
						pnotify_addclass : NOTIFY_LOCATIONS[location],
						pnotify_delay : NOTIFY_DELAY,
						pnotify_stack : NOTIFY_STACKS[location],
						pnotify_type : type
					};

					return $.pnotify(opt).bgiframe();
				},

				beforeShow : function (me, id) {
					return !!id;
				},
                
				showWindowInfo : function (me) {
					return {
						title : '查看' + me.entityName,
						width : me.width,
						height : me.height
					};
				},
                
				beforeShowData : function (me, id, data) {
					return me.records[id];
				},
                
				show : function (me) {
					var id = me.offerId(me);
					if (me.beforeShow(me, id) === false) {
						return;
					}

					var fetchData = false;
					try {
						fetchData = me.beforeShowData(me, id);
					} catch (e) {}
					Z.tpl({
						tpl : me.formTpl,
						url : (fetchData ? '' : getViewUrl(me) + '?id=' + id),
						before : function (data) {
							return fetchData ? fetchData : me.beforeShowData(me, id, data);
						},
						success : function (html, data, origData) {
							var windowInfo = me.showWindowInfo(me);
							var dialog = Z.msg(html, null, {title : windowInfo.title, width : windowInfo.width, height : windowInfo.height});
							$('.fun1', dialog).hide();
							if (!me.showWithoutBlock) { //save the old show style
								$(dialog).block({ message : null });
								$('.blockUI', dialog).css('cursor', 'default');
							} else {
								$('input[type="button"]', dialog).hide();
								$('input', dialog).attr('readonly', true).attr('disabled', true);
                                $('textArea', dialog).attr('readonly', true).attr('disabled', true);
								$('select', dialog).attr('disabled', true);
                                
								if (me.showWithAttachment) {
									Z.invoke('z.showUploadedAttachments', dialog, me.moduleName);
								}
							}
							me.afterShowWindow(me, dialog, data, origData);
						}
					});
				},
                
				afterShowWindow : function (me, dialog, data, origData) {},
                
				innerShow : function (me, id) {
					me.innerEditId = id;
					me.show(me);
				},
                
				refresh : function (me) {
					if (me.pager) {
                        me.pager.reload();
                    } else {
                        me.init(me);
                    }
				},
                
				recall : function (me) {},
                
				send : function (me) {},

				beforeOperate : function (me, selectedData, comparedColumn, comparedType) { //判断操作之前当前登录人是不是发起人或者超级管理员
					comparedColumn = comparedColumn || 'createUserId';
					comparedType = comparedType || 'id';
					var loginUser = Z.invoke('z.getCurrentUserInfo'),
                        loginedValue = loginUser[comparedType],
                        adminValue = comparedType === 'id' ? 1 : '超级管理员',
                        comparedResult = true,
                        selectedValue = selectedData[comparedColumn];
					if (adminValue !== loginedValue && loginedValue !== selectedValue) {
						comparedResult = false;
					}
					return comparedResult;
				},

				operators : ['add', 'edit', 'del', 'refresh', 'show'],
				operatorTarget : '#operators',
				operatorHTML : '<li><a href="javascript:ivk(\'{{method}}\')"><img src="resources/images/{{operatorImage}}" align="absmiddle" title="{{operatorText}}"/></a></li>',
				operatorImages : {
					'add' : 'search_icon1.gif', //新增
					'edit' : 'modify.png', //修改
					'del' : 'delete.png', //删除
					'show' : 'preview.png', //查看
					'refresh' : 'search_icon2.gif', //刷新
					'recall' : 'return.png', //取回
					'exportData' : 'export.png', //导出
					'importData' : 'import.png' //导入
				},
				operatorNames : {
					'add' : '新增',
					'edit' : '编辑',
					'del' : '删除',
					'show' : '查看',
					'refresh' : '刷新',
                    'recall' : '取回',
					'exportData' : '导出Excel',
					'importData' : '导入'
				},

				getOperatorImages : function (me, name) {
					return me.operatorImages[name];
				},
                
				getOperatorNames : function (me, name) {
					return me.operatorNames[name];
				},
                
				getOperatorHtml : function (me, name) {
					var tpl = me.operatorHTML,
					data = {
						operatorImage : me.getOperatorImages(me, name),
						method : me.moduleName + '.' + name,
						operatorText : me.getOperatorNames(me, name)
					};
					return Mustache.to_html(tpl, data);
				},

				initOperators : function (me, tag) {
					var htmls = [];
					$.each(me.operators, function (i, v) {
						if (me[v])
							htmls.push(me.getOperatorHtml(me, v));
					});
					$(me.operatorTarget, tag).html(htmls.join(''));
				},
                
				denied : {
					'1' : ['add', 'edit', 'del', 'innerEdit', 'recall', 'send', 'repeal'],
					'2' : [],
					'3' : []
				},
                
				setPrivilege : function (me, pri) {
					me.privilege = pri;
					var deny = me.denied[pri] || [];
					$.each(deny, function (i, v) {
						delete me[v];
					});
				},
                
				getPrivilege : function (me) {
					return me.privilege;
				},

				//search
				beforeSearchData : function (me, data) {
					return data;
				},
                
				search : function (me, form) {
					var data = {};
					if (form) {
						data = Z.getFormData(form);
					} else {
						data = Z.getFormData($(me.contentTarget));
					}

					if (me.searchText == data['name']) {
						data['name'] = '';
					}

					data = me.beforeSearchData(me, data) || {};
					if (me.pager) {
						me.pager.extra(data);
						me.pager.gotoPage(1);
					} else {
						me.extraData = data;
						me.initNoPageList(me);
					}
				},
                
				exportData : function (me) {
					var url = Z.CONTEXT + me.moduleUrl + 'export.action';
					if (me.pager) {
						var p = me.pager.fill({});
						var pp = {
							dataLevel : me.dataLevel
						};
						$.each(p, function (k, v) {
							if (v)
								pp[k] = v;
						});
						url += '?' + $.param(pp);
					}

					window.open(url, '_self');

				},
                
				renderManualDatepicker : function (dialog, selector) { //允许手动填日期
					if (selector) {
						$(selector, dialog).datepicker({
							showOn : 'div',
							buttonImageOnly : true
						});
					} else {
						$('.time_style', dialog).datepicker({
							showOn : 'div',
							buttonImageOnly : true
						});
					}
				},
                
				renderDatepicker : function (dialog, selector) { //只允许单击选择时间
					if (selector) {
						$(selector, dialog).datepicker();
						$(selector, dialog).addClass('readonly').attr('readonly', 'true');
					} else {
						$('.time_style', dialog).datepicker();
						$('.time_style', dialog).addClass('readonly').attr('readonly', 'true');
					}
				},
                
				renderCalendar : function (dialog, selector) {
					if (selector) {
						$(selector, dialog).calendar();
					} else {
						$('.calendar_style', dialog).calendar();
					}
				},
                
				renderFullCalender : function (dialog, selector, options) { // solar and lunar calender
					selector = selector || '.jquery-fullCalender';
					var config = {
						defaultSelected : [], //['2013-5-8 12:00 - 2013-5-8 23:59', '2013-5-15 00:00 - 2013-5-15 23:59'], //enanbleSingleDateZone : true,// defaultSelected : ['2013-04-18 12:20:00', '2013-05-19', '2013-05-21', '2013-05-22'], //enanbleSingleDateZone : false,
						enableClick : true, // 是否允许点击操作
						isMultiSelectd : true, //是否多选
						enanbleSingleDateZone : true, // 是否使用一天作为一个区间
						onSelect : function (selectedDate, tdObject) {}
						// withTimeSelected : true, // 是否使用时间后缀
						// timeSuffix : '', // 时间后缀格式
						//$.fn.fullCalendar.formatDate('yy-mm-dd', new Date());
						//$.fn.fullCalendar.getSelectedDates(datepicker); // 获取选择的时间
						//$.fn.fullCalendar.setSelectedDates(datepicker, ['2013-05-24']); //设置选中的时间enanbleSingleDateZone : false
						//$.fn.fullCalendar.setSelectedDates(datepicker, ['2013-5-24 12:00 - 2013-5-24 23:59']); //设置选中的时间enanbleSingleDateZone : true
						//$.fn.fullCalendar.setSelectedDates(cal, ['2013-8-7'], ['2013-8-6']);//设置销差样式
					};
					$.extend(config, options);
					$(selector, dialog).fullCalendar(config);
				},
                
				validateFormData : function (me, data, rules, context) {
					var i = 0,
					len = rules.length,
					rule = null,
					name = '',
					vResult = true,
					validated = true;
					for (; i < len; i++) {
						rule = rules[i];
						name = rule.name;

						vResult = me.validateField(name, data[name], context, {
                            nullTip : rule.nullTip,
                            regexp : rule.regexp,
                            regexpTip : rule.regexpTip,
                            originalCls : rule.originalCls,
                            warringCls : rule.warringCls,
                            compareValue : rule.compareValue,
                            compareType : rule.compareType,
                            compareTip : rule.compareTip,
                            fieldType : rule.fieldType,
                            dateFormat : rule.dateFormat,
                            dateFormatError : rule.dateFormatError,
                            customSelector : rule.customSelector
                        });
						if (!vResult) {
							validated = false;
						}
					}
					return validated;
				},
                
				validateField : function (fl, checkField, dialog, otherParams) {
                    otherParams = otherParams || {},
					var field = null, regexp = otherParams.regexp,
                        regexpTip = otherParams.regexpTip || '类型不对',
                        nullTip = otherParams.nullTip || '不能为空',
                        originalCls = otherParams.originalCls || 'input_style',
                        warringCls = otherParams.warringCls || 'form_input_red',
                        fieldType = otherParams.fieldType || 'input',
                        customSelector = otherParams.customSelector,
                        dateFormat = otherParams.dateFormat,
                        dateFormatError = otherParams.dateFormatError || '时间格式不对，正确格式如：2012-01-02',
                        compareValue = otherParams.compareValue,
                        compareType = otherParams.compareType,
                        compareTip = otherParams.compareTip;

					var flag = true;
					if (customSelector) {
						field = $(customSelector, dialog);
					} else {
						field = $(fieldType + '[name="' + fl + '"]', dialog);
					}
					if (!checkField && otherParams.nullTip) {
						field.attr('title', nullTip);
						field.removeClass(originalCls);
						field.addClass(warringCls);
						flag = false;
					} else {
						if (checkField && regexp && regexp instanceof RegExp) {
							if (!regexp.test(checkField)) {
								field.attr('title', regexpTip);
								field.removeClass(originalCls);
								field.addClass(warringCls);
								flag = false;
							} else {
								field.attr('title', '');
								field.removeClass(warringCls);
								field.addClass(originalCls);
								flag = true;
							}
						} else {
							field.attr('title', '');
							field.removeClass(warringCls);
							field.addClass(originalCls);
							flag = true;
						}
					}

					if (flag && dateFormat) {
						try {
							$.datepicker.parseDate(dateFormat, checkField);
						} catch (e) {
							field.attr('title', dateFormatError);
							field.removeClass(originalCls);
							field.addClass(warringCls);
							flag = false;
						}
						if (flag) {
							field.attr('title', '');
							field.removeClass(warringCls);
							field.addClass(originalCls);
							flag = true;
						}
					} else if (flag && compareType && compareType === 'date') {
						var compareResult = new Date(checkField.replace(/-/g, '/')).getTime() - new Date(compareValue.replace(/-/g, '/')).getTime(); // be careful getTime will return Nan in IE
						if (compareResult < 0) {
							field.attr('title', compareTip);
							field.removeClass(originalCls);
							field.addClass(warringCls);
							flag = false;
						} else {
							field.attr('title', '');
							field.removeClass(warringCls);
							field.addClass(originalCls);
							flag = true;
						}
					}
					return flag;
				}
			};
		},
        
		define : function (name, opt, ignoreDefault) {
			var id = '#' + name.replace(/\./g, '_');
			this.log('define a module use name:', name);
			if (ignoreDefault === true) {
				Z.Cache.set(name, opt, 'module-backup');
				return;
			}

			var prefix = name.replace(/\./g, '/');
			var module = Z.defaultModule();
			$.extend(module, {
				formTpl : prefix + '_form.html',
				manageTpl : prefix + '_manage.html',
				listTpl : prefix + '_list.html',
				moduleUrl : prefix + '-',
				delUrl : prefix + '/delete',
				contentTarget : id
			});
			$.each(module, function (k, v) {
				if (opt[k]) {
                    module['super_' + k] = v;
                }
			});
			opt.moduleName = name;
			var obj = $.extend(module, opt);
			if (obj.needExport) {
                obj.operators && obj.operators.push('export');
            }
			Z.Cache.set(name, obj, 'module-backup');
		},

		regist : function (name, privilege, dataLevel) {
			var module = Z.Cache.get(name, 'module-backup');
			if (!module) {
                return;
            }
			module.dataLevel = dataLevel;
			Z.Cache.set(name, module, 'module');
			Z.Cache.remove(name, 'module-backup');
			if (!privilege && privilege !== 0) {
                return;
            }
			Z.invoke(name + '.setPrivilege', privilege);
		},

		registButtons : function (name, btns) {
			var module = Z.Cache.get(name, 'module');
			if (module && !module.useLocalOperators) {
				module.operators = btns;
			}
		},

		cleanModule : function () {
			var bkms = Z.Cache['module-backup'];
			$.each(bkms, function (k, v) {
				var opts = v.operators;
				$.each(opts || [], function (i, vv) {
					delete v[vv];
				});
				Z.Cache.set(k, v, 'module');
			});
			delete Z.Cache['module-backup'];
		},

		invoke : function (name) {
			if (!name)
				return;
			var args = $.makeArray(arguments),
                names = name.split('.'),
                methodName = names.pop(),
                moduleName = names.join('.');
			var module = Z.Cache.get(moduleName, 'module');
			if (!module) {
				this.log('invoke by ', name, ' but module ', moduleName, ' not exists.');
				return;
			}
			var method = module[methodName];
			if (!method) {
				this.log('invoke by ', name, ' but method ', methodName, ' not exists.');
				return;
			}

			if ($.isFunction(method)) {
				args.shift();
				args.unshift(module);
				return method.apply(module, args);
			}
			if (typeof(method) == 'object') {
				args.shift();
				var key = args.shift();
				return method[key];
			}
		}
    });

	window.ivk = function () {
		Z.invoke.apply(Z, $.makeArray(arguments));
	};

	window.initModule = function (name, label) {
		var id = '#' + name.replace(/\./g, '_');
		// TODO: Z.invoke('z.addTab', id, label);
		init(name);
	};

	window.init = function (name, handler) {
		Z.invoke(name + '.init');
	};
    
	window.Z = Z;
})(window, jQuery);