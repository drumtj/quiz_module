
/**
 * @fileOverview 웹 콘텐츠제작용 library
 * @version 1.0
 * @author taejin (drumtj@gmail.com)
 */

/**
 * @see <a href="http://jquery.com/">http://jquery.com/</a>
 * @name jQuery 
 * @class
 * See the jQuery Library  (<a href="http://jquery.com/">http://jquery.com/</a>) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */


/**
 * @see <a href="http://jquery.com/">http://jquery.com/</a>
 * @name fn
 * @class
 * See the jQuery Library  (<a href="http://jquery.com/">http://jquery.com/</a>) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 * @memberOf jQuery
 */

(function(){
	
	if( !("jQuery" in window) ){
		throw new Error("sg library is require jQuery");
	}
	
	var toString = {}.toString
		, slice = [].slice;
	
	var //readyCallbackList = []
		initCallbackList = []
		, customTagList = {}
		, customAttrList = {}
		, setStageFunc
		, setScaleModeFunc
		, progressImg;
	
	//private
	var version = "1.0"
		, scaleMode = "none"
		, scaleX = 0
		, scaleY = 0
		, stageWidth = 0
		, stageHeight = 0
		, $stage = null
		, $content = null
		, $body = null
		, $window = $( window )
		;
	
	//support
	if( !("forEach" in Array.prototype) ){
		Array.prototype.forEach = function ( callback ){
			for( var i=0; i<this.length; i++ ){
				callback.call( window, this[ i ] );
			}
		}
	}
	
	
	
	/**
	 * 마우스 커서를 'pointer'로 설정한다.
	 * @function
	 * @name pointer
	 * @memberOf jQuery.fn
	 * @example
	 * $( element ).pointer();
	 * @example
	 * $( element ).pointer( false );
	 * @param {boolean} bool
	 * @returns jQuery object
	 * @type jQuery Object
	 */
	jQuery.fn.pointer = function(){
		return $( this ).css( "cursor", arguments[0] == false ? "auto" : "pointer" );
	};
	
	/**
	 * css값을 숫자로 반환 (ex: "11px"에서 "px"제거한 숫자 값)
	 * @function
	 * @name cssVal
	 * @memberOf jQuery.fn
	 * @example
	 * $( element ).cssVal( "margin-top" );
	 * @param {string} cssName
	 * @returns value
	 * @type number
	 */
	jQuery.fn.cssVal = function( cssName ){
		var num = parseFloat( $( this ).css( cssName ) );
		return isNaN( num ) ? 0 : num;
	};
	
	/**
	 * 특정 custom tag를 추출하는 함수. 자식 엘리먼트들 중에서 custom tag를 추출한다.
	 * @function
	 * @name getCustomTag
	 * @memberOf jQuery.fn
	 * @example
	 * $( 'p' ).getCustomTag( "sg-btn-hide" );
	 * @param {string} tagName
	 * @returns jQuery object
	 * @type jQuery Object
	 * @link sg.addCustomTag 커스텀태그 정의함수 참고
	 */
	jQuery.fn.getCustomTag = function( tagName ){
		var isRoot = (this == $);
		for( var o in customTagList ){
			if( tagName == o ){
				if( isRoot ) return $( "[" + customTagList[ o ].identifier + "]" );
				else return $( this ).children( "[" + customTagList[ o ].identifier + "]" );
			}
		}
		return $;
	};
	
	/**
	 * 특정 custom tag를 추출하는 함수. 
	 * @function
	 * @name getCustomTag
	 * @memberOf jQuery
	 * @example
	 * $.getCustomTag( "sg-btn-hide" );
	 * @param {string} tagName
	 * @returns jQuery object
	 * @type jQuery Object
	 * @link sg.addCustomTag 커스텀태그 정의함수 참고
	 */
	jQuery.getCustomTag = jQuery.fn.getCustomTag;
	
	
	
	function swapTag( obj, findTagName, swapTagName, identifier ) {
		if ( document.querySelector( findTagName ) ) {
			identifier = identifier ? ' ' + identifier + ' ' : '';
			obj.html = obj.html
				.replace( new RegExp( '<' + findTagName, 'g' ), '<' + swapTagName + identifier )
				.replace( new RegExp( '</' + findTagName + '>', 'g' ), '</' + swapTagName + '>' );
		}else{
			customTagList[ findTagName ].nothing = true;
		}
	}
	
	function replaceTagList(){
		var obj = {	html: document.body.innerHTML }
			, customTagName
			, customAttrName
			, ctInfo, caInfo, i, j, k
			, setBool = (customAttrList.length + customTagList.length == 0) ? false : true
			;
		
		
		if( setBool ){
			for( customTagName in customTagList ){
				ctInfo = customTagList[ customTagName ];
				swapTag(obj, customTagName, ctInfo.originTag, ctInfo.identifier);
			};
		
			//add custom attribute prefix : data-
			var sgAttrNameReg = /\ssg([\-][\w]*){1,5}(\s)?=/gi,
				s1 = obj.html.split('<'),
				s2, matchArr, r2 = [];
	
			for ( i = 0; i < s1.length; i++ ) {
				s2 = s1[ i ].split( '>' );
				for ( j = 0; j < s2.length; j++ ) {
					if ( j % 2 == 0 ) {
						matchArr = s2[ j ].match( sgAttrNameReg );
						if ( matchArr ) {
							for ( k = 0; k < matchArr.length; k++ ) {
								s2[ j ] = s2[ j ].replace( matchArr[ k ], " data-" + matchArr[ k ].substr( 1 ) );
							}
						}
					}
				}
				r2.push( s2.join( '>' ) );
			}
			
			obj.html = r2.join( '<' );
			document.body.innerHTML = obj.html;
			
			//support placeholder bug
			$( "[placeholder]" ).each(function(i,e){
				$( this ).text("").attr( "placeholder", $( this ).attr("placeholder") );
			});
			
			//function apply for custom tags
			var $customTag;
			for( customTagName in customTagList ){
				ctInfo = customTagList[ customTagName ];
				if( ctInfo.nothing ) continue;
				
				$customTag = $.getCustomTag( customTagName );
				
				if( sg.isFunction( ctInfo[ "initFunc" ] ) ){
					ctInfo[ "initFunc" ].call( sg );
				}
				
				//execute to init function of custom attribute for each custom tag
				$customTag.each(function(index, element) {
					$( element ).data( "_customTagName", customTagName );
					sg.setOption( element );
					if( /^sg-btn-/.test( customTagName ) ) $( element ).pointer();
					if( sg.isFunction( ctInfo[ "eachInitFunc" ] ) ){
						ctInfo[ "eachInitFunc" ].call( element, element );
					}
					sg.initAttr( element );
				});
				
				//execute to action function of custom attribute when called event handle
				if( ctInfo[ "eventName" ] ){
					$customTag.bind( ctInfo[ "eventName" ], function( e ){
						var ctname = $( this ).data( "_customTagName" );
						if ( !$( this ).data( "options" ).enabled ) return;
						if( sg.isFunction( customTagList[ ctname ][ "eventFunc" ] ) ) customTagList[ ctname ][ "eventFunc" ].call( this, this, e );
						sg.actionAttr( this );
					});
				};
				$customTag = null;
			};
			
			//apply custom attribute for all tag
			for( customAttrName in customAttrList ){
				caInfo = customAttrList[ customAttrName ];
				if( caInfo.isForEveryTags ){
					if( caInfo && sg.isFunction( caInfo[ "init" ] ) ){
						$( "[data-" + customAttrName + "]" ).each(function( i, element ){
							sg.setOption( element );
							caInfo[ "init" ].call( element, element, element.getAttribute( "data-" + customAttrName ) );
						});
					}
				}
			}
		}
		
		delete s1;
		delete s2;
		delete r2;
		delete obj;
		delete matchArr;		
	}
	
	//call by 'resize' event
	var _ww, _hh, _ch, _msc;
	function applyScaleMode(){
		_ww = $window.width();
		_hh = $window.height();
		_ch = $content.height();
		_ch += $content.cssVal( "border-top-width" ) + $content.cssVal( "border-bottom-width" );
		_ch += $content.cssVal( "margin-top" ) + $content.cssVal( "margin-bottom" );
		_ch += $content.cssVal( "padding-top" ) + $content.cssVal( "padding-bottom" );
		
		switch( scaleMode ){
			case "showall":
				_msc = Math.min(_ww / stageWidth, _hh / stageHeight);
				if(_ch - stageHeight <= 1){
					//컨텐츠가 스테이지보다 클 때
					if(_ch * _msc > _hh){
						//console.log("top 0, overflow:visible");
						$stage.css({
							"transform" : "scale(" + _msc + ")",
							"transform-origin" : "0 0",
							"left" : ((_ww - stageWidth * _msc) * 0.5) + "px",
							"top" : 0
						});
						
						$stage.parent().css({
							"overflow-y" : "visible"
						});
					}
					//컨텐츠가 스테이지 안에 있을 때
					else{
						//console.log("top center, overflow:hidden");
						$stage.css({
							"transform" : "scale(" + _msc + ")",
							"transform-origin" : "0 0",
							"left" : ((_ww - stageWidth * _msc) * 0.5) + "px",
							"top" : ((_hh - _ch * _msc) * 0.5) + "px"
						});
						
						$stage.parent().css({
							"overflow-y" : "hidden"
						});
					}
				}
				else{
					//console.log("top center, overflow:auto");
					$stage.css({
						"transform" : "scale(" + _msc + ")",
						"transform-origin" : "0 0",
						"left" : ((_ww - stageWidth * _msc) * 0.5) + "px",
						"top" : ((_hh - stageHeight * _msc) * 0.5) + "px"
					});
					
					$stage.parent().css({
						"overflow-y" : "auto"
					});	
				}
				scaleX = scaleY = _msc;
			break;
			
			case "noscale":
				scaleX = scaleY = 1;
				$stage.css({
					"transform" : "scale(" + scaleX + ")",
					"transform-origin" : "0 0"
				});
			break;
			
			case "exactfit":
				scaleX = _ww / stageWidth;
				scaleY = _hh / stageHeight;
				$stage.css({
					"transform" : "scale(" + scaleX + ", " + scaleY + ")",
					"transform-origin" : "0 0"
				});
			break;
		}
	}
	
	
	/**
	 * @namespace 웹 콘텐츠제작용 library
	 * @author taejin (drumtj@gmail.com)
	 * @name sg
	 * @version 1.0
	 * @since 2014.09.22
	 * @description
	 * sg library는 jQuery를 필요로 하는 library입니다.<br>
	 * scaleMode설정, custom attribute와 custom tag제작 API를 제공합니다.<br>
	 */
	var sg = {
		/**
		 * [Read Only] sg library의 버전정보. 
		 * @readonly
		 * @name version
		 * @memberOf sg
		 * @type string
		 */
		get version() { return version },
		
		/**
		 * [Read Only] stage의 scale방식. sg.setScaleMode 함수로 설정되며 "showall", "exactfit", "none"의 값이 설정될 수 있다.
		 * @readonly
		 * @name scaleMode
		 * @memberOf sg
		 * @type string
		 */
		get scaleMode() { return scaleMode },
		
		/**
		 * [Read Only] stage의 X축 scale값. sg.setScaleMode 함수로 scaleMode가 설정되면 값이 계산된다. 이 비율은 stage의 width를 기준으로 계산된다.
		 * @readonly
		 * @name scaleX
		 * @memberOf sg
		 * @type number 0.0 ~ 1.0
		 */
		get scaleX() { return scaleX },
		
		/**
		 * [Read Only] stage의 Y축 scale값. sg.setScaleMode 함수로 scaleMode가 설정되면 값이 계산된다. 이 비율은 stage의 height를 기준으로 계산된다.
		 * @readonly
		 * @name scaleY
		 * @memberOf sg
		 * @type number 0.0 ~ 1.0
		 */
		get scaleY() { return scaleY },
		
		/**
		 * [Read Only] stage의 width값. setStage함수로 stage설정시 stage의 width값을 읽어온다.
		 * @readonly
		 * @name stageWidth
		 * @memberOf sg
		 * @type number
		 */
		get stageWidth() { return stageWidth },
		
		/**
		 * [Read Only] stage의 height값. setStage함수로 stage설정시 stage의 height값을 읽어온다.
		 * @readonly
		 * @name stageHeight
		 * @memberOf sg
		 * @type number
		 */
		get stageHeight() { return stageHeight },
		
		/**
		 * [Read Only] 스테이지로 설정된 엘리먼트. sg.setStage함수로 설정된다.
		 * @readonly
		 * @name $stage
		 * @memberOf sg
		 * @type jQuery Object
		 */
		get $stage() { return $stage },
		
		/**
		 * [Read Only] stage의 자식요소들을 감싼 컨테이너이다. $stage가 설정될 때 생성된다.
		 * @readonly
		 * @name $content
		 * @memberOf sg
		 * @type jQuery Object
		 */
		get $content() { return $content },
		
		/**
		 * [Read Only] $("body")
		 * @readonly
		 * @name $body
		 * @memberOf sg
		 * @type jQuery Object
		 */
		get $body() { return $body },
		
		/**
		 * [Read Only] $(window)
		 * @readonly
		 * @name $window
		 * @memberOf sg
		 * @type jQuery Object
		 */
		get $window() { return $window },
		
		/**
		 * sg에 기능을 추가하거나 확장할 수 있다.
		 * @function
		 * @name extend
		 * @memberOf sg
		 * @example
		 * sg.extend({
		 * 	myfunc: function( ){
		 *		//TO DO
		 * 	}
		 * });
		 *
		 * sg.myfunc();
		 * @param {object} property
		 * @link sg.super 참고
		 */
		extend: function( prop ){
			if(typeof prop !== "object"){ throw new Error("sg.extend arguments is not Object!"); }
			
			for( var name in prop ){
				//sg.hasOwnProperty( name )
				if( name in sg ) prop[ name ]._super = sg[ name ];
				sg[ name ] = prop[ name ];
			}
		},
		
		/**
		 * sg.extend를 통해 확장한 함수에서 원래 함수를 호출할 때 사용
		 * @function
		 * @name super
		 * @memberOf sg
		 * @example
		 * sg.extend({
		 * 	myfunc: function( str ){
		 *		return '<<' + str + '>>';
		 * 	}
		 * });
		 *
		 * sg.myfunc( 'abc' ); //return "<<abc>>"
		 *
		 * sg.extend({
		 * 	myfunc: function( str ){
		 *		return this.super( str.toUpperCase() );
		 * 	}
		 * });
		 *
		 * sg.myfunc( 'abc' ); //return "<<ABC>>"
		 * @param {object} [arguments=undefined] 원래 함수의 arguments.
		 * @return {*} 원래 함수의 반환 값.
		 * @type *
		 * @link sg.extend 참고
		 */
		super: function(){
			var _super = arguments.callee.caller._super;
			return sg.isFunction( _super ) ? _super.apply( this, arguments ) : null;
		}
	};
	
	
	sg.extend({
		/**
		 * 대상이 함수인지 확인. jQuery의 isFunction 함수를 사용.
		 * @function
		 * @name isFunction
		 * @memberOf sg
		 * @param {object} object
		 * @returns true or false
		 * @type boolean
		 */
		isFunction: $.isFunction,
		
		/**
		 * 대상이 배열인지 확인. jQuery의 isArray 함수를 사용.
		 * @function
		 * @name isArray
		 * @memberOf sg
		 * @param {object} object
		 * @returns true or false
		 * @type boolean
		 */
		isArray: $.isArray,
		
		/**
		 * 대상이 window객체인지 확인. jQuery의 isWindow 함수를 사용.
		 * @function
		 * @name isWindow
		 * @memberOf sg
		 * @param {object} object
		 * @returns true or false
		 * @type boolean
		 */
		isWindow: $.isWindow,
		
		/**
		 * 대상이 숫자인지 확인. jQuery의 isNumeric 함수를 사용.
		 * @function
		 * @name isNumeric
		 * @memberOf sg
		 * @param {object} object
		 * @returns true or false
		 * @type boolean
		 */
		isNumeric: $.isNumeric,
		
		/**
		 * 대상이 빈 오브젝트인지 확인. jQuery의 isEmptyObject 함수를 사용.
		 * @function
		 * @name isEmptyObject
		 * @memberOf sg
		 * @param {object} object
		 * @returns true or false
		 * @type boolean
		 */
		isEmptyObject: $.isEmptyObject,
		
		/**
		 * 대상이 배열에 포함되어 있는지 확인. jQuery의 inArray 함수를 사용.
		 * @function
		 * @name inArray
		 * @memberOf sg
		 * @param {object} element
		 * @param {array} array
		 * @param {number} index
		 * @returns true or false
		 * @type string
		 */
		inArray: $.inArray,
		
		/**
		 * 대상의 data type을 반환. jQuery의 type 함수를 사용.
		 * @function
		 * @name type
		 * @memberOf sg
		 * @param {object}
		 * @returns true or false
		 * @type string
		 */
		type: $.type
	});
	
	
	
	sg.extend({
		
		/**
		 * 초기실행 callback함수를 추가한다. 이렇게 추가된 callback함수들은 초기 실행과정 진행 후에 실행된다.
		 * @function
		 * @name addInit
		 * @memberOf sg
		 * @example
		 * sg.addInit( function(){} );
		 * @param {function} callback
		 */
		addInit: function( callback ){
			initCallbackList.push( callback );
		},
		
		/**
		 * progress image의 경로를 설정한다. 설정된 image는 page loading하는 동안 화면에 나타난다.
		 * @function
		 * @name setLoadingImage
		 * @memberOf sg
		 * @example
		 * sg.setLoadingImage( '../common/img/progress.gif' );
		 * @param {string} path
		 */
		setLoadingImage: function( path ){
			progressImg = new Image();
			progressImg.setAttribute("data-sg-id", "progressImg");
			progressImg["onload"] = function( e ){
				this.style.left = (((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - this.width) * 0.5) + "px";
				this.style.top = (((window.innerHeight || document.documentElement.clientWidth || document.body.clientWidth) - this.height) * 0.5) + "px";
				if( !sg.isReady ) document.body.appendChild( progressImg );
				else delete progressImg;
			};
			progressImg.src = path;
			progressImg.style.position = "fixed";
			progressImg.style.visibility = "visible";
		},
		
		/**
		 * stage를 설정한다. 설정된 stage는 sg.$stage로 접근 할 수 있다. stage는 scale조절의 기준이 된다.
		 * @function
		 * @name setStage
		 * @memberOf sg
		 * @example
		 * sg.setStage( "#stage" );
		 * @param {object} elementOrSelector
		 */
		setStage: function( elementOrSelector ){
			setStageFunc = function(){
				var $temp = $( elementOrSelector );
				if( $temp.length == 0 ) throw new Error( "setStage : $stage is not select. (selector : " + elementOrSelector + ")" );
				
				$temp.attr( "data-sg-id", "stage" );
				$content = $( "<div data-sg-id='content'></div>" );
				$content.append( $temp.contents() );
				
				$temp.append( $content ).css( "position", "absolute" );
				$temp.parent().css( "overflow-x", "hidden" );
				
				//border가 없으면, 때로는 크기가 잘 못 계산되기 때문에
				if( $temp.cssVal( "border-top-width" ) == 0 ){
					$temp.css( "border", "solid 1px rgba(255,255,255,0)" );
				}
				
				stageWidth = $temp.width();
				stageHeight = $temp.height();
				
				$content.css({
					"min-height": stageHeight,
					"visibility": "hidden"
				});
							
				$stage = $temp;
				
				//apply scaleMode
				if( setScaleModeFunc ){
					setScaleModeFunc.apply( sg );
					setScaleModeFunc = null;
				}
			}
			
			if( sg.isReady ){
				setStageFunc.apply( sg );
				setStageFunc = null;
			}
		},
		
		/**
		 * scaleMode를 설정한다. stage가 설정되어야 기능이 작동하며, "showall", "exactfit", "none"의 모드가 있다.
		 * @function
		 * @name setScaleMode
		 * @memberOf sg
		 * @example
		 * sg.setStage( "#stage" );
		 * sg.setScaleMode( "showall" );
		 * @example
		 * sg.setStage( "#stage" );
		 * sg.setScaleMode( "exactfit" );
		 * @param {string} scaleMode
		 */
		setScaleMode: function( _scaleMode ){
			scaleMode = _scaleMode;
			setScaleModeFunc = function(){
				$window.bind( "resize" , function(){
					applyScaleMode();
				});
				applyScaleMode();
			}
			
			if( $stage ){
				setScaleModeFunc.apply( this );
				setScaleModeFunc = null;
			}
		},
		
		//options setting for custom tags
		/**
		 * $(target).data("options")에 Custom tag 처리시 사용할 값을 저장한다. 
		 * @function
		 * @name setOption
		 * @memberOf sg
		 * @example
		 * sg.setOption( element );
		 * @example
		 * sg.setOption( element , {myClicked: false} );
		 * @param {object} elementOrSelector 	- element나 jQuery selector
		 * @param {object} [options=undefined]	- options값이 전달되지 않았다면 기본값을 넣는다.
		 */
		setOption: function ( target, options ){
			var op = { enabled: true };
			for( var o in options ) op[ o ] = options[ o ];
			$( target ).data( "options", op );
		},
		
		/**
		 * 커스텀 속성 등록.<br>
		 * 속성 정의시 applyAll값을 true로 설정하면 모든 태그에서 사용 할 수 있다.<br>
		 * applyAll값이 false면 custom tag에 명시될 때 속성의 기능이 사용된다.<br>
		 * 보통 정의되는 커스텀속성은 특별한 기능을 가지고 있고, 이 기능은 이벤트가 있는 커스텀태그가 동작할 때 실행 되도록 하기 때문에
		 * applyAll값은 기본값인 false로 그대로 둔다.
		 * @function
		 * @name addCustomAttr
		 * @memberOf sg
		 * @param {object} 		option 						- 커스텀 속성의 초기화 객체
		 * @param {string} 		option.name					- 커스텀 속성의 이름
		 * @param {function} 	[option.init=undefined]		- 초기화 함수. 초기 설정 시점에 실행
		 * @param {function} 	[option.action=undefined]	- 기능 함수. 이 커스텀 속성을 사용하는 커스텀 태그의 이벤트 처리시 실행
		 * @param {boolean} 	[option.applyAll=true]		- 모든 기본 태그에서도 이 속성의 기능을 적용 할 것인지 여부. true or false.
		 * @example
		 * //script
		 * sg.addCustomAttr({
		 *	name: "sg-fadeIn",
		 *	init: function( element, attrValue ){
		 *		$( element ).fadeIn();
		 *	},
		 * 	applyAll: true
		 * });
		 * //html
		 * &lt;div sg-fadeIn&gt; ABCD &lt;/div&gt;
		 * @example
		 * //script
		 * sg.addCustomAttr({
		 *	name: "sg-color",
		 *	init: function( element, attrValue ){
		 * 		$( element ).css( "color", attrValue );
		 * 	},
		 *	applyAll: true
		 * });
		 * //html
		 * &lt;div sg-color="red"&gt; ABCD &lt;/div&gt;
		 * @example
		 * sg.addCustomAttr({
		 *	name: "sg-alert",
		 *	action: function( element, attrValue ){
		 * 		if( attrValue ) alert( attrValue );
		 * 	}
		 * });
		 * @link sg.addCustomTag 커스텀태그 정의함수 참고
		 */
		addCustomAttr: function( obj ){
			customAttrList[ obj.name ] = {
				init: obj.init,
				action: obj.action,
				isForEveryTags: obj.applyAll
			}
		},
		
		/**
		 * 커스텀 태그 등록.<br>
		 * 커스텀 태그의 기본 매커니즘은 문자열 치환이다.<br> 페이지로딩 후 body의 html에서 커스텀태그를 찾아 정의된 기본태그로 바꾼다.<br>
		 * 커스텀 태그 정의시 치환할 원래의 태그 이름을 originTag에 적어준다. 커스텀 태그는 이벤트가 있을 수도 있고 없을 수도 있다. tagInit에 함수를 정의해서
		 * 태그의 내부 구조만 바꾸는 커스텀 태그를 만들 수도 있고, event이름과 eventHandle에 함수를 정의하여 특정 이벤트시 동작하는 커스텀 태그를 만들 수도 있다.
		 * @function
		 * @name addCustomTag
		 * @memberOf sg
		 * @param {object} 		option 											- 커스텀 태그의 초기화 객체
		 * @param {string}		option.name										- 커스텀 태그의 이름
		 * @param {string}		[option.originTag="div"]						- 교체할 태그의 이름.
		 * @param {string}		[option.id="data-sg-id={name of custom tag}"]	- custom tag의 식별자로 특수한 경우가 아니면 기본값을 사용.
		 * @param {array}		[option.attr=undefined]							- custom tag에서 사용 될 custom attribute 이름을 나열한 배열
		 * @param {function}	[option.init=undefined]							- 초기설정 때 실행 될 내용이 있다면 이곳에 함수를 정의한다.
		 * @param {function}	[option.tagInit=undefined]						- 초기설정 때 각 태그마다 실행 될 내용이 있다면 이곳에 함수를 정의한다.
		 * @param {string}		[option.event=undefined]						- 특정 이벤트로 동작한다면 이벤트 이름을 넣는다.
		 * @param {function}	[option.eventHandle=undefined]					- 이벤트의 처리 함수를 정의한다.
		 * @example
		 * //script
		 * sg.addCustomTag({
		 *	name: "sg-depth",
		 * 	tagInit: function( element ){
		 *		$("&lt;p&gt;&lt;/p&gt;").append( $( element ).contents() ).appendTo( $( element ) );
		 * 	}
		 * });
		 * //html
		 * &lt;sg-depth&gt; ABCD &lt;sg-depth&gt;
		 * //result
		 * &lt;sg-depth&gt; &lt;p&gt;ABCD&lt;/p&gt; &lt;sg-depth&gt;
		 * @example
		 * //script
		 * sg.addCustomTag({
		 *	name: "sg-h1",
		 *	attr: [ "sg-color", "sg-alert" ],
		 * 	tagInit: function( element ){
		 * 		$( element ).css( "font-size", "40pt" );
		 * 	},
		 * 	event: "click",
		 * 	eventHandle: function( element ){
		 * 		$( element ).animate( {"font-size": "80pt"} );
		 * 	}
		 * });
		 * //html
		 * &lt;sg-h1 sc-color="blue" sg-alert="hello!"&gt; ABCD &lt;/sg-h1&gt;
		 * @link jQuery.getCustomTag 커스텀 태그 추출함수 참고
		 * @link sg.addCustomAttr 커스텀속성 정의함수 참고
		 */
		addCustomTag: function( obj ){
			customTagList[ obj.name ] = {
				originTag: obj.originTag ? obj.originTag : "div",
				identifier: obj.id ? obj.id : "data-sg-id='" + obj.name + "'",
				eventName: obj.event,
				attrList: (function( list ){
					if( !list ) return null;
					else list = slice.call( list );//copy array
					var i=0, attrName;
					list.forEach( function(attrName){
						if( !(attrName in customAttrList) ) list.splice( i, 1 );
						else i++;
					});
					return list;
				})( obj.attr ),
				initFunc: obj.init,
				eachInitFunc: obj.tagInit,
				eventFunc: obj.eventHandle
			}
		},
		
		//initialize about custom attribute in custom tag
		/**
		 * 커스텀 태그 정의시 설정한, 사용되는 속성에 대한 초기화 함수.
		 * @function
		 * @name initAttr
		 * @memberOf sg
		 * @example sg.initAttr( element );
		 * @param {object} element
		 */
		initAttr: function( element ){
			//console.log( element, arguments.callee );
			var customTagName = $( element ).data( "_customTagName" )
				, attrList, attr, attrValue;
				
			if( customTagName ){
				attrList = customTagList[ customTagName ].attrList;
				if( attrList ){
					attrList.forEach(function( attrName ){
						attr = customAttrList[ attrName ];
						attrValue = element.getAttribute( "data-" + attrName );
						if( attr && attr[ "init" ] && !attr.isForEveryTags ){
							attr[ "init" ].call( element, element, attrValue );
						}
					});
				}
			}
		},
		
		//execute function about custom attribute in custom tag
		/**
		 * 커스텀 태그에 정의된 커스텀 속성의 action함수 실행.
		 * @function
		 * @name actionAttr
		 * @memberOf sg
		 * @example sg.actionAttr( element );
		 * @param {object} element
		 */
		actionAttr: function( element ){
			var customTagName = $( element ).data( "_customTagName" )
				, attrList, attr, attrValue;
				
			if( customTagName ){
				attrList = customTagList[ customTagName ].attrList;
				if( attrList ){
					attrList.forEach(function( attrName ){
						attr = customAttrList[ attrName ];
						attrValue = element.getAttribute( "data-" + attrName );
						if( attr && attr[ "action" ] ){
							attr[ "action" ].call( element, element, attrValue );
						}
					});
				}
			}
		},
		
		
		
		/**
		 * jQuery.hide
		 * @function
		 * @name hide
		 * @memberOf sg
		 * @example
		 * sg.hide( 'p' );	//$( 'p' ).hide();
		 * sg.hide( this ); //$( this ).hide();
		 * @param {object} elementOrSelector
		 */
		hide: function( elementOrSelector ){
			$( elementOrSelector ).hide();
		},
		
		/**
		 * jQuery.show
		 * @function
		 * @name show
		 * @memberOf sg
		 * @example
		 * sg.show( 'p' );	//$( 'p' ).show();
		 * sg.show( this ); //$( this ).show();
		 * @param {object} elementOrSelector
		 */
		show: function( elementOrSelector ){
			$( elementOrSelector ).show();
		},
		
		/**
		 * jQuery.fadeIn("slow")
		 * @function
		 * @name fadeIn
		 * @memberOf sg
		 * @example
		 * sg.fadeIn( 'p' );	//$( 'p' ).fadeIn( 'slow' );
		 * sg.fadeIn( this );	//$( this ).fadeIn( 'slow' );
		 * @param {object} elementOrSelector
		 */
		fadeIn: function( elementOrSelector ){
			$( elementOrSelector ).fadeIn("slow");
		},
		
		/**
		 * jQuery.fadeOut("slow")
		 * @function
		 * @name fadeOut
		 * @memberOf sg
		 * @example
		 * sg.fadeOut( 'p' );	//$( 'p' ).fadeOut( 'slow' );
		 * sg.fadeOut( this );	//$( this ).fadeOut( 'slow' );
		 * @param {object} elementOrSelector
		 */
		fadeOut: function( elementOrSelector ){
			$( elementOrSelector ).fadeOut("slow");
		},
		
		/**
		 * 커스텀 태그가 이벤트에 동작하도록 허용하고 cursor를 pointer로 설정.
		 * @function
		 * @name enabled
		 * @memberOf sg
		 * @example
		 * sg.enabled( this );
		 * sg.enabled( '#myButton' );
		 * sg.enabled( $.getCustomTag( 'sg-btn-hide' ) );
		 * @param {object} elementOrSelector
		 * @returns jQuery Object
		 * @type jQuery Object
		 */
		enabled: function ( elementOrSelector ){
			return $(elementOrSelector).each(function(i,e){
				var $this = $(this);
				$this.css("cursor","pointer");
				var options = $this.data("options") || {};
				options.enabled = true;
				$this.data("options", options);
			});
		},
		
		/**
		 * 커스텀 태그가 이벤트에 동작하지 않도록 하고 cursor를 default로 설정.
		 * @function
		 * @name disabled
		 * @memberOf sg
		 * @example
		 * sg.disabled( this );
		 * sg.disabled( '#myButton' );
		 * sg.disabled( $.getCustomTag( 'sg-btn-hide' ) );
		 * @param {object} elementOrSelector
		 * @returns jQuery Object
		 * @type jQuery Object
		 */
		disabled: function ( elementOrSelector ){		
			return $(elementOrSelector).each(function(i,e){
				var $this = $(this);
				$this.css("cursor","default");
				var options = $this.data("options") || {};
				options.enabled = false;
				$this.data("options", options);
			});
		}
	});
	
	sg.extend({
		/**
		 * 초기 실행 함수, parameter로 callback함수가 전달 된다면 초기 설정 진행 후에 callback함수 실행.<br>
		 * sg.init()을 할 경우 내부에서 html content가 로드된 후 초기설정을 진행 하도록 처리한다.<br>
		 * 초기화 후 실행할 내용이 있다면 init()의 parameter로 callback 함수를 넘겨준다.
		 * @function
		 * @name init
		 * @memberOf sg
		 * @example
		 * sg.setStage( "#stage" );
		 * sg.setScaleMode( "showall" );
		 * sg.init();
		 * @example
		 * sg.setStage( "#stage" );
		 * sg.setScaleMode( "showall" );
		 * sg.init( function(){} );
		 * @param {function} [callback=undefined]
		 */
		init: function ( callback ) {
			function _init(){
				//////setting
				//console.log("setting");
				$body = $( document.body );
				
				replaceTagList();
				
				if( setStageFunc ){
					setStageFunc.apply( sg );
					setStageFunc = null;
				}
				
				///compatibility for old versions
				if( "init" in window && sg.isFunction( window[ "init" ] ) ){
					window[ "init" ].apply( window );
				}
				
				if( "initList" in window ){
					initCallbackList = initCallbackList.concat( window[ "initList" ] );
				}
				///
				
				initCallbackList.forEach( function( initFunc ){
					if( sg.isFunction( initFunc ) ) initFunc.apply( window );
				});
				
				
				$("[data-sg-id='progressImg']").remove();
				$content = $("[data-sg-id='content']").css( "visibility", "visible" );
				$stage = $("[data-sg-id='stage']");
				sg.isReady = true;
				
				setTimeout(function(){
					$window.trigger("resize");
				}, 0);
			}
			
			if( $.isReady ){
				_init.apply( window );
				if( sg.isFunction( callback ) ) callback.apply( window );
			}else{
				$( document ).ready(function(e) {
                    _init.apply( window );
					if( sg.isFunction( callback ) ) callback.apply( window );
                });
			}
		}
	});
	
	
	
	//-------------------------------------------------------------------
	var Klass = function(){
		var Parent, props, Child, F, i;
		if( arguments.length == 1){
			Parent = Object;
			props = arguments[0];
		}else if( arguments.length == 2){
			Parent = arguments[0];
			props = arguments[1];
		}else{
			console.log("Klass arguments.length : ", arguments.length);
			return {};
		}
		
		Child = function(){
			//var creator;
			if( Child.uber && Child.uber.hasOwnProperty("init") ){
				Child.uber.init.apply( this, arguments );
			}
			if( Child.prototype.hasOwnProperty("init") ){
				Child.prototype.init.apply( this, arguments );
			}
		};
		
		F = function(){};
		F.prototype = Parent.prototype;
		Child.prototype = new F();
		Child.uber = Parent.prototype;
		Child.prototype.constructor = Child;
		
		for( i in props ){
			if( props.hasOwnProperty(i) ){
				Child.prototype[i] = props[i];
			}
		}
		
		return Child;
	}
	
	sg.ns = function( nsStr ){
		var parts = nsStr.split('.'),
			parent = sg,
			i;
		
		if( parts[0] === "sg" ) parts = parts.slice(1);
		
		for( i=0; i<parts.length; i++ ){
			if( typeof parent[parts[i]] === "undefined" ){
				parent[parts[i]] = {};
			}
			parent = parent[parts[i]];
		}
		return parent;
	}
	
	//옵션 합치기
	function mergeOptions( dopt, nopt ){
		var opt = {};
		if( dopt ){
			for( var o in dopt ){
				if( nopt && typeof nopt[o] !== "undefined" ) opt[o] = nopt[o];
				else opt[o] = dopt[o];
			}
		}
		return opt;
	}
	
	//키로 jquery객체 정렬
	function sortJObj( $jobj, attr, key ){
		var temp, i, j, len, arr=[];
		if( $jobj ){
			$jobj.each(function(i, e){
				arr[i] = parseInt($(e).attr(attr).replace(key, ''));
				//$(e).data("_idx", parseInt($(e).attr(attr).replace(key, '')));
			});
			
			len = $jobj.length;
			for( i=0; i<len-1; i++ ){
				for( j=i+1; j<len; j++ ){
					if(arr[i] > arr[j]){
						temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
						temp = $jobj[i]; $jobj[i] = $jobj[j]; $jobj[j] = temp;
					}
				}
			}
		}
	}
	
	//--------------------------------------------------------------------------------
	
	jQuery.expr[':'].regex = function(elem, index, match) {
		var matchParams = match[3].split(','),
			validLabels = /^(data|css):/,
			attr = {
				method: matchParams[0].match(validLabels) ? 
							matchParams[0].split(':')[0] : 'attr',
				property: matchParams.shift().replace(validLabels,'')
			},
			regexFlags = 'ig',
			regex = new RegExp(matchParams.join().replace(/^\s+|\s+$/g,''), regexFlags);
		return regex.test(jQuery(elem)[attr.method](attr.property));
	}


	
	

	//Klass area
	
	/**
	 * @name kit
	 * @namespace
	 * @memberOf sg
	 */
	sg.kit = {};
	
	/**
	 * sg.kit.SingleSelect 생성자
	 * @class
	 * @name Kit
	 * @memberOf sg.kit
	 */
	sg.kit.Kit = Klass({
		kitName: "kit",
		$elements: null,
		isActive: false,
		$root: null,
		options:null,
		doptions:{
			attr: "id",
			value: "p",
			activeClass: "active"
		},
		
		/**
		 * sg.kit.Kit 생성자
		 * @constructor
		 * @name Kit
		 * @memberOf sg.kit.Kit
		 * @param {object}		elementOrSelector								- 엘리먼트나 선택자
		 * @param {object} 		[options=undefined]								- 변경할 옵션 값이 있는 오브젝트
		 * @param {string}		[options.attr=undefined]						- 상호작용할 엘리먼트를 식별할 식별자가 들어있는 속성이름
		 * @param {string}		[options.value=undefined]						- 식별자
		 * @param {string}		[options.activeClass=undefined]					- 상호작용 대상에 추가/제거할 css class 이름
		 */
		init: function( elementOrSelector, opt ){
			console.log("kit:init");
			this.$root = $( elementOrSelector ).eq(0);
			this.options = mergeOptions( this.doptions, opt );
			//정규식으로 select
			this.$elements = this.$root.children(":regex("+ this.options.attr +", ^"+ this.options.value +"[0-9]{0,2}$)");
			//키가되는 값으로 jquery객체내부를 정렬
			sortJObj( this.$elements, this.options.attr, this.options.value );
			
			this.enable();
		},
		
		getAnswer: function() {
			return null;
		},
		
		setAnswer:function ( answer ){
		},
		
		getAnswerJSON: function() /*@String*/{
			var ans = this.getAnswer();
			if( typeof ans === "string" ) ans = '"' + ans + '"';
			return '{"type": "'+this.kitName+'", "answer": '+ ans +'}';
		},
		
		setAnswerJSON: function( answerJSON /*@String*/){
			var answerObj = JSON.parse( answerJSON );
			this.setAnswer( answerObj.answer );
		},
		
		enable: function(){
		},
		
		disable: function(){
			this.isActive = false;
			this.$elements.off().pointer(false);
		}
	});
	

	
	/*
	Kit Default Options
	{
		attr: "id",
		value: "p",
		activeClass: "active"
	}
	
	example SingleSelect Options
	{
		attr: "id",				//동작할 element에서 식별자를 가져올 속성 이름을 정한다.
		value: "btn",			//식별자로 사용할 키값. kit내부에서는 이 값에 번호가 붙여진 대상들을 상호작용 대상으로 삼는다.
		activeClass: "checked"	//상호작용시 추가할 css class 이름이다.
	}
	*/
	
	/*###############################################################################
	############################## kit.SingleSelect #################################
	#################################################################################*/
	/**
	 * 단일선택형 kit<br>
	 * @class
	 * @name SingleSelect
	 * @memberOf sg.kit
	 * @example
	 * var element = document.getElementById("selectTypeKit");
	 * var sskit = new sg.kit.SingleSelect( element );
	 * @example
	 * //sg.kit.SingleSelect( selector, [options] );
	 * var sskit = new sg.kit.SingleSelect( "#selectTypeKit" );
	 * @example
	 * var answer = sskit.getAnswer();
	 * sskit.reset();
	 * sskit.setAnswer( answer );
	 * sskit.check( correctAnswer );	 
	 * sskit.disable();
	 * sskit.enable();
	 */
	sg.kit.SingleSelect = Klass( sg.kit.Kit, {
		/**
		 * 답 추출시 포함할 kit의 이름
		 * @type {string}
		 */
		kitName: "singleSelect",
		
		_clickAction: function( element ){
			if( this._$tempSel ){
				if( this._$tempSel.is( element )) return;
				this._$tempSel.removeClass( this.options.activeClass );
			}
			this._$tempSel = $( element ).addClass( this.options.activeClass );
		},
		
		/**
		 * sg.kit.SingleSelect 생성자
		 * @constructor
		 * @augments Kit
		 * @name SingleSelect
		 * @memberOf sg.kit.SingleSelect
		 * @param {object}		elementOrSelector								- 엘리먼트나 선택자
		 * @param {object} 		[options=undefined]								- 변경할 옵션 값이 있는 오브젝트
		 * @param {string}		[options.attr=undefined]						- 상호작용할 엘리먼트를 식별할 식별자가 들어있는 속성이름
		 * @param {string}		[options.value=undefined]						- 식별자
		 * @param {string}		[options.activeClass=undefined]					- 상호작용 대상에 추가/제거할 css class 이름
		 */
		init: function( elementOrSelector, opt ){
			console.log("singleSelect:init");
		},
		
		/**
		 * 현재의 상태를 재구현할 수 있는 문자열로 추출 (답 추출)
		 * @function
		 * @name getAnswer
		 * @memberOf sg.kit.SingleSelect
		 * @returns {string}
		 */
		getAnswer: function() /*@String*/{
			var $activeElement = this.$root.children("." + this.options.activeClass);
			if( $activeElement.length == 0 ) return null;
			
			return $activeElement.index().toString();
		},
		
		/**
		 * 재구현 문자열을 넣어서 상태를 재구현
		 * @function
		 * @name setAnswer
		 * @memberOf sg.kit.SingleSelect
		 * @param {string}
		 */
		setAnswer: function( answer /*@String*/){
			this._clickAction( this.$elements.eq( answer ) );
		},
		
		/**
		 * 정답 문자열을 받아서 현재의 상태와 비교(정답체크)
		 * @function
		 * @name check
		 * @memberOf sg.kit.SingleSelect
		 * @returns {boolean}
		 */
		check: function( correctAnswer ){
			return this.getAnswer() == correctAnswer;
		},
		
		/**
		 * 현재 상태를 제거하여 처음과 같이 만듬
		 * @function
		 * @name reset
		 * @memberOf sg.kit.SingleSelect
		 */
		reset: function(){
			this.$elements.removeClass( this.options.activeClass );
		},
		
		/**
		 * 상호작용이 가능하도록 만든다. 생성자 실행시 호출된다 (Kit을 상속받은 이유로)
		 * @function
		 * @name enable
		 * @memberOf sg.kit.SingleSelect
		 */
		enable: function(){
			if(!this.isActive){
				this.isActive = true;
				var self = this;
				this.$elements.bind("click", function(e){
					self._clickAction( this );
				}).pointer();
			}
		}
	});
	
	
	/*###############################################################################
	############################## kit.MultiSelect #################################
	#################################################################################*/
	/**
	 * 단일선택형 kit<br>
	 * @class
	 * @name MultiSelect
	 * @memberOf sg.kit
	 * @example
	 * var element = document.getElementById("multiSelectTypeKit");
	 * var mskit = new sg.kit.MultiSelect( element );
	 * @example
	 * //sg.kit.MultiSelect( selector, [options] );
	 * var mskit = new sg.kit.MultiSelect( "#multiSelectTypeKit" );
	 * @example
	 * var answer = mskit.getAnswer();
	 * mskit.reset();
	 * mskit.setAnswer( answer );
	 * mskit.check( correctAnswer );	 
	 * mskit.disable();
	 * mskit.enable();
	 */
	sg.kit.MultiSelect = Klass( sg.kit.Kit, {
		/**
		 * 답 추출시 포함할 kit의 이름
		 * @type {string}
		 */
		kitName: "multiSelect",
		
		_clickAction: function( element ){
			var ac = this.options.activeClass;
			
			if( $( element ).hasClass( ac ) ) $( element ).removeClass( ac );
			else $( element ).addClass( ac );
		},
		
		/**
		 * sg.kit.MultiSelect 생성자
		 * @constructor
		 * @augments Kit
		 * @name MultiSelect
		 * @memberOf sg.kit.MultiSelect
		 * @param {object}		elementOrSelector								- 엘리먼트나 선택자
		 * @param {object} 		[options=undefined]								- 변경할 옵션 값이 있는 오브젝트
		 * @param {string}		[options.attr=undefined]						- 상호작용할 엘리먼트를 식별할 식별자가 들어있는 속성이름
		 * @param {string}		[options.value=undefined]						- 식별자
		 * @param {string}		[options.activeClass=undefined]					- 상호작용 대상에 추가/제거할 css class 이름
		 */
		init: function( elementOrSelector, opt ){
			console.log("mulltiSelect:init");
		},
		
		/**
		 * 현재의 상태를 재구현할 수 있는 문자열로 추출 (답 추출)
		 * @function
		 * @name getAnswer
		 * @memberOf sg.kit.MultiSelect
		 * @returns {string}
		 */
		getAnswer: function() /*@String*/{
			//var opt = this.options;
			var $activeElement = this.$root.children("." + this.options.activeClass);
			if( $activeElement.length == 0 ) return null;
			
			var v = [];//, k = [];
			$activeElement.each(function( i, e ){
				var $this = $(this);
				v.push( $this.index() );
				//k.push( $this.attr(opt.attr) );
			});
			
			return JSON.stringify(v);
		},
		
		/**
		 * 재구현 문자열을 넣어서 상태를 재구현
		 * @function
		 * @name setAnswer
		 * @memberOf sg.kit.MultiSelect
		 * @param {string}
		 */
		setAnswer: function( answer /*@String*/){
			if( !answer ) return;
			var self = this;
			var arr = JSON.parse( answer );
			$( arr ).each(function( i, e ){
				self._clickAction( self.$elements.eq( e ) );
			});
		},
		
		/**
		 * 정답 문자열을 받아서 현재의 상태와 비교(정답체크)
		 * @function
		 * @name check
		 * @memberOf sg.kit.MultiSelect
		 * @returns {boolean}
		 */
		check: function( correctAnswer ){
			return this.getAnswer() == correctAnswer;
		},
		
		/**
		 * 현재 상태를 제거하여 처음과 같이 만듬
		 * @function
		 * @name reset
		 * @memberOf sg.kit.MultiSelect
		 */
		reset: function(){
			this.$elements.removeClass( this.options.activeClass );
		},
		
		/**
		 * 상호작용이 가능하도록 만든다. 생성자 실행시 호출된다 (Kit을 상속받은 이유로)
		 * @function
		 * @name enable
		 * @memberOf sg.kit.MultiSelect
		 */
		enable: function(){
			if(!this.isActive){
				this.isActive = true;
				var self = this;
				this.$elements.bind("click", function(e){
					self._clickAction( this );
				}).pointer();
			}
		}
	});
	
	//--------------------------------------------------------------------------------
	
	window.sg = sg;
	
	return sg;
})();