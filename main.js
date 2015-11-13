$(document).ready(function(){
	var canvas      = document.createElement('canvas'),
        context     = canvas.getContext('2d'),
		img         = $('img#image')[0],
		imgWrapper  = $('div#image-wrapper')[0],
		changes     = [],
		addChange   = true,
		cropped     = false,
		changeIndex,
		clockwise,
		counterClockwise,
		lastImage,
		currentImage,
		imgScale, 
		initHeight,
        liveFilterBase,
        fontStyle = 'Arial';
   
	//input. draw to canvas
	$('input#image-upload').on('change', imgLoad);

    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    //rectangular selector
	$('button#rectangular-selector').on('click', function (event) {    
		var $this = $(this);
		$this.buttonController();

		if($this.val() === 'ON') {
		    $('div#image-wrapper').on('mousedown', function (event) {
		        var startTop  = event.pageY,
		            startLeft = event.pageX,
		            $box      = $('<div id="selection"></div>'),
		            $wrapper  = $('div#image-wrapper'),
		            offset    = $wrapper.offset(); 

		        $('#selection').remove();
		        $('div#image-wrapper').append($box);

		        $(window).on('mousemove', function (event) {
		            var top    = startTop,
		                left   = startLeft,
		                bottom = event.pageY,
		                right  = event.pageX,
		                height = Math.abs(bottom - top),
		                width  = Math.abs(right - left);

		            event.preventDefault();

		            if (bottom < top) top  = bottom;
		            if (right < left) left = right;

		            $box.css({
		                top: (top - offset.top) + 'px',
		                left: (left - offset.left) + 'px',
		                height: height + 'px',
		                width: width + 'px'
		            })
		        });

		        $(window).one('mouseup', function (event) { 
		            $(window).off('mousemove');
		        });
	   		 });
		}
		else {
			$('div#image-wrapper').off('mousedown');
		}
	});

	$('button#zoom-in').on('click', function (event) {
		var $this = $(this);
		$this.buttonController();

		if ($this.val() === 'ON') {
			$('img#image').on('click', function (event) {	
				var resize   = 1.1,
					mouseX   = event.pageX,
					mouseY   = event.pageY,
					newH     = img.height * resize,
					newW     = img.width * resize,
					imgDiv   = img.parentNode;

				imgScale = newH/initHeight;
				event.preventDefault();

				// imgWrapper.style.top  = (mouseY * (resize / 100)) - (newH / 2) / 2 + 'px';
				// imgWrapper.style.left  = (mouseX * (resize / 100)) - (newW / 2) / 2 + 'px';

				img.height = newH;
				img.width  = newW;
			});
		}
		else {
			$('img#image').off('click');
		}
	});

	$('button#zoom-out').on('click', function (event) {
		var $this = $(this);
		$this.buttonController();

		if ($this.val() === 'ON') {
			$('img#image').on('click', function (event) {	
				var resize = 0.9,
					mouseX = event.pageX,
					mouseY = event.pageY,
					newH   = img.height * resize,
					newW   = img.width * resize,
					imgLeft = mouseX * .09,
					imgTop  = mouseY * .09;


				event.preventDefault();

				imgScale = newH/initHeight;

				// imgWrapper.style.top  = (mouseY * (resize / 100)) + (newH / 2) / 2 + 'px';
				// imgWrapper.style.left  = (mouseX * (resize / 100)) + (newW / 2) / 2 + 'px';

				img.height = newH;
				img.width  = newW;
			});
		}
		else {
			$('img#image').off('click');
		};
	});

	//nav around image 
	$('button#nav').on('click', function (event) {
		var $this = $(this);
		$this.buttonController();

		if ($this.val() === 'ON'){
			$('div#image-wrapper').on('mousedown', function (event) {
				var startX  = event.pageX,
					startY  = event.pageY;
					imgLeft = imgWrapper.offsetLeft,
					imgTop  = imgWrapper.offsetTop;

				event.preventDefault();

				$(window).on('mousemove', function (event) {
					var	clickX   = event.pageX,
						clickY   = event.pageY,
						offsetX  = clickX - startX,
						offsetY  = clickY - startY;

					event.preventDefault();
						
					imgWrapper.style.top  = imgTop + offsetY + 'px';
					imgWrapper.style.left = imgLeft + offsetX + 'px';

				});

				$(window).one('mouseup', function (event) {
					$(window).off('mousemove');
				});
			});
		}
		else {
			$('div#image-wrapper').off('mousedown');
		}

	});

    //crop
    $('button[name="crop-image"]').on('click', function (event) {
        var $selection = $('#selection'),
            position   = $selection.position(),
            height     = $selection.height()/imgScale,
            width      = $selection.width()/imgScale,
            imgData    = context.getImageData(position.left/imgScale, position.top/imgScale, width, height),
            $this = $(this);
        $this.buttonController();

        canvas.height = height;
        canvas.width  = width;
        initHeight    = height;

        context.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL();
        imgWrapper.style.top = 0 + 'px';
        imgWrapper.style.left = 0 + 'px';
        $selection.remove();
        cropped = true;
    });

    //rotate clockwise
    $('button#clockwise').on('click', function (event) {
        var angleInDegrees = 0,
            $this = $(this);

        $this.buttonController();

    	angleInDegrees = (angleInDegrees + 90) % 360;
    	drawRotated(angleInDegrees);
        clockwise = true;
    });

    //rotate counter clockwise
    $('button#counter-clockwise').on('click', function (event) {
    	var angleInDegrees = 0,
            $this = $(this);

        $this.buttonController();

    	angleInDegrees = (angleInDegrees - 90) % 360;
    	drawRotated(angleInDegrees);
    	counterClockwise = true;
    });

    //write text
	 $('button#text').on('click', function (event) {
    	var position  = $('#selection').position(),
    		text      = $('#text-content').val(),
    		textSize  = $('#text-size').val(),
    		textColor = $('#text-color').val(),
            $this     = $(this);

        $this.buttonController();

    	context.fillStyle = textColor;
    	context.font = textSize + "px " + fontStyle;
    	context.textBaseline = 'top';
    	context.fillText(text, position.left / imgScale, position.top / imgScale);
    	img.src = canvas.toDataURL();		
	});

    //change fonts for text
    $('select#font-style').on('change', function (event) {
        fontStyle = $('input#text-content')[0].style.fontFamily = event.currentTarget.value;
    });

    //canvas layer for painting
    $('button#paint').on('click', function (event) {
        var $paintLayer  = $('<canvas id="paint-layer" style="z-index 2"></canvas>'),
            $this        = $(this),
            $wrapper     = $('div#image-wrapper'),
            offset       = $wrapper.offset(),
            coords       = [],
            paintCanvas  = $paintLayer[0],
            paintContext = paintCanvas.getContext('2d');

        paintCanvas.width  = img.width;
        paintCanvas.height = img.height;
        $this.buttonController();
        $wrapper.append($paintLayer);

        if($this.val() === 'ON') {
            $('canvas#paint-layer').on('mousedown', function (event) {
                var x = event.pageX - offset.left,
                    y = event.pageY - offset.top;

                event.preventDefault();
                paint = true;
                coords.push({ x: x, y: y, drag: false });
                reDraw(coords, paintContext);

                $(window).on('mousemove', function (event) {
                    var x = event.pageX - offset.left,
                        y = event.pageY - offset.top;
                    if (paint) {
                        coords.push({ x: x, y: y, drag: true });
                        reDraw(coords, paintContext);
                    }
                });
            });

            $(window).on('mouseup', function (event) {

                paint = false;
                reDraw(coords, context, imgScale);
                coords = [];
                img.src = canvas.toDataURL();
            });
        }
    });

	$('button#undo').on('click', undo);
    $('button#redo').on('click', redo);
    $('button#grayscale').on('click', grayscale);
    $('button#sepia').on('click', sepia);
    $('input#brightness').on('mouseup', brightness);
    $('input#contrast').on('mouseup', contrast);

    function reDraw (coords, ctx, scale) {
        var paintColor = $('#paint-color').val();
            lineSize  = $('#line-size').val();

        ctx.strokeStyle = paintColor;
        ctx.lineJoin    = "round";
        scale           = scale || 1;
        ctx.lineWidth   = lineSize / scale;

        for (var i = 0; i < coords.length; i++) {
            ctx.beginPath();
            if (coords[i].drag && i) {
                ctx.moveTo(coords[i-1].x / scale, coords[i-1].y / scale);
            }
            else {
                ctx.moveTo((coords[i].x-1) / scale, coords[i].y / scale);
            }
            ctx.lineTo(coords[i].x / scale, coords[i].y / scale);
            ctx.closePath();
            ctx.stroke();
        }
    }

    function drawRotated (degrees) {
    	var	temp = canvas.width;

    	canvas.width  = canvas.height;
    	canvas.height = temp;
    	context.save();
    	
    	if (degrees > 0) {
    	 context.translate(canvas.width, 0);
    	}
    	
    	else {
    	context.translate(0, canvas.height);
    	}

    	context.rotate(degrees * Math.PI/180);
    	context.drawImage(img, 0, 0);
    	context.restore();
    	img.src = canvas.toDataURL();   	
    }

    function changeCanvasCallback (canvas, context) { //make undo/redo happen here
		var href = canvas.toDataURL('image/png');
		$('a#save').prop('href', href);
		$('#filename').on('change', function (event) {
			$('a#save').prop('download', $('#filename').val());
		});
		lastImage = currentImage;
        currentImage = context.getImageData(0, 0, canvas.width, canvas.height);
        if (addChange) {
        	makeChange();
        }
        else {
        	addChange = true;
        }
	}

	function imgLoad (event) {
		if(event) img.src = URL.createObjectURL(event.target.files[0]);
    	
    	img.removeAttribute('height');
    	img.removeAttribute('width');
    	
    	imgScale = 1.00;


    	img.onload = function() {
            initHeight    = this.height;
            canvas.height = this.height;
            canvas.width  = this.width;
            context.drawImage(img, 0, 0, this.width, this.height);
            liveFilterBase = context.getImageData(0, 0, canvas.width, canvas.height);
            updateImage.call(this);
            this.onload = updateImage;
    	};

        function updateImage () {
            changeCanvasCallback(canvas, context);
            this.height = canvas.height * imgScale;
            this.width  = canvas.width * imgScale;
        }
	}

	function grayscale () {
		var imgData = context.getImageData(0, 0, canvas.width, canvas.height),
			r,
			g,
			b,
			average;

		for (var i = 0; i < imgData.data.length; i+=4) {
			r = imgData.data[i];
			g = imgData.data[i+1];
			b = imgData.data[i+2];
			average = (r + g + b) / 3;
			imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = average;
		}
		
		context.putImageData(imgData, 0, 0);
		img.src = canvas.toDataURL();
	}

	function makeChange () {
		var change 		 = {};
		currentImage = context.getImageData(0, 0, canvas.width, canvas.height);
		
		if (!lastImage) return;
	
		//cropped

		if (cropped) {
			change.cropped = lastImage;
			change.croppedRedo = currentImage;
			cropped = false;
		}
		//rotated, direction of rotation saved
		else if (clockwise || counterClockwise) {
			if (clockwise) {
				change.rotated = 'right';
				clockwise = false;
			}
			else {
				change.rotated = 'left';
				counterClockwise = false;
			}
		}
		//diffs
		else {
			change.diffs = [];
			for (var i = 0; i < currentImage.data.length; i++){
				if (currentImage.data[i] != lastImage.data[i]) {
					diff = currentImage.data[i] - lastImage.data[i];
					change.diffs.push([i, diff]);
				}
			}
		}

		if (changeIndex < changes.length - 1){
			changes.splice(changeIndex+1, changes.length - changeIndex+1);
		}

		changes.push(change);
		changeIndex = changeIndex + 1 || 0;
	}

    //grayscale filter
    function grayscale () {
        var imgData = context.getImageData(0, 0, canvas.width, canvas.height),
            r, g, b, average,
            $this = $(this);
        $this.buttonController();

        for (var i = 0; i < imgData.data.length; i+=4) {
            r = imgData.data[i];
            g = imgData.data[i+1];
            b = imgData.data[i+2];
            average = (r + g + b) / 3;

            imgData.data[i]   = average;
            imgData.data[i+1] = average;
            imgData.data[i+2] = average;
        }
        context.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL();
    }

    //sepia filter
    function sepia () {
        var imgData = context.getImageData(0, 0, canvas.width, canvas.height),
            r, g, b,
            $this = $(this);
        $this.buttonController();

        for (var i = 0; i < imgData.data.length; i+=4) {
            r = imgData.data[i];
            g = imgData.data[i+1];
            b = imgData.data[i+2];

            imgData.data[i]   = (r * 0.393)+(g * 0.769)+(b * 0.189);
            imgData.data[i+1] = (r * 0.349)+(g * 0.686)+(b * 0.168);
            imgData.data[i+2] = (r * 0.272)+(g * 0.534)+(b * 0.131);
        }
        context.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL();
    }

    //brightness filter
    function brightness (event) {
        var $this   = $(this),
            adjusts = parseInt($this.val()),
            imgData = context.getImageData(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < imgData.data.length; i+=4) {
            imgData.data[i]   = liveFilterBase.data[i] + adjusts;
            imgData.data[i+1] = liveFilterBase.data[i+1] + adjusts;
            imgData.data[i+2] = liveFilterBase.data[i+2] + adjusts;
        }
        context.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL();
    }

    //contrast filter
    function contrast (event) {
        var $this   = $(this),
            imgData = context.getImageData(0, 0, canvas.width, canvas.height),
            adjusts = parseInt($this.val()),
            factor = (259 * (adjusts + 255)) / (255 * (259 - adjusts)),
            r, g, b;

        for (var i = 0; i < imgData.data.length; i+=4) {
            r = liveFilterBase.data[i];
            g = liveFilterBase.data[i+1];
            b = liveFilterBase.data[i+2];

            imgData.data[i]   = factor * (r - 128) + 128;
            imgData.data[i+1] = factor * (g - 128) + 128;
            imgData.data[i+2] = factor * (b - 128) + 128;
        }
        context.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL();
    }

    //undo changes
	function undo () {
		var change = changes[changeIndex],
            $this = $(this);
        $this.buttonController();

		addChange = false;

		if (!change) {
			addChange = true;
			return console.log('undo end');
		}
	
		if (change.cropped){
			canvas.height = change.cropped.height;
			canvas.width  = change.cropped.width;
			context.putImageData(change.cropped, 0, 0);
		}		
		else if (change.rotated === 'left') {
			drawRotated(90);
		}
		else if (change.rotated === 'right') {
			drawRotated(-90);
		}
		else {
			for (var i = 0; i < change.diffs.length; i++){
				var index = change.diffs[i][0],
					diff  = change.diffs[i][1];
				currentImage.data[index] = currentImage.data[index] - diff;
			}
			context.putImageData(currentImage, 0 , 0);
		}
		changeIndex--;
		img.src = canvas.toDataURL();
	}

	function redo () {
		var change;
		
		change = changes[changeIndex+1];
		addChange = false;
		
		if (!change) {
			addChange = true;
			return console.log('redo end');
		}
		//cropped
		if (change.croppedRedo) {
			canvas.height = change.croppedRedo.height;
			canvas.width  = change.croppedRedo.width;
			context.putImageData(change.croppedRedo, 0, 0);
		}
		else if (change.rotated === 'left') {
			drawRotated(-90);
		}	
		else if (change.rotated === 'right') {
			drawRotated(90);
		}
		//diffs
		else {
			for (var i = 0; i < change.diffs.length; i++){
				var index = change.diffs[i][0];
					diff  = change.diffs[i][1];
				currentImage.data[index] += diff;
			}
			
			context.putImageData(currentImage, 0, 0);
		}		
		changeIndex++;
		img.src = canvas.toDataURL();
	}

    //button hide/show paint stuff
    $("button#toggle-paint").click(function(){
        $("button#paint").toggle();
        $("input#line-size").toggle();
        $("input#paint-color").toggle();
    });

	$.fn.buttonController = function () { //refactor with a variable that holds the last button pressed and turn it and only it off  
		var $rectSelect    = $('button#rectangular-selector'),
			$zoomIn        = $('button#zoom-in'),
			$zoomOut       = $('button#zoom-out'),
			$nav           = $('button#nav'),
			$paint  	   = $('button#paint'),
            $rotateClock   = $('button#clockwise'),
            $rotateCounter = $('button#counter-clockwise'),
            $crop          = $('button[name="crop-image"]'),
            $undo          = $('button#undo'),
            $grayscale     = $('button#grayscale'),
            $sepia         = $('button#sepia'),
            $text          = $('button#text');

		if (this.val() === 'OFF' || this.hasClass('btn-default')) {

			$rectSelect.val('OFF');
			$rectSelect.removeClass('btn btn-success').addClass('btn btn-danger');
			$('div#image-wrapper').off('mousedown');

			$zoomIn.val('OFF');
			$zoomIn.removeClass('btn btn-success').addClass('btn btn-danger');
			$('img#image').off('click');

			$zoomOut.val('OFF');
			$zoomOut.removeClass('btn btn-success').addClass('btn btn-danger');
			$('img#image').off('click');

			$nav.val('OFF');
			$nav.removeClass('btn btn-success').addClass('btn btn-danger');
			$('div#image-wrapper').off('mousedown');

            $paint.val('OFF');
            $paint.removeClass('btn btn-success').addClass('btn btn-danger');
            $('img#image').off('click');
            $('canvas#paint-layer').off('mousedown');
            $('canvas#paint-layer').off('mousemove');
            $('canvas#paint-layer').remove();

            $rotateClock.val('OFF');

            $rotateCounter.val('OFF');

            $crop.val('OFF');

            $undo.val('OFF');

            $grayscale.val('OFF');

            $sepia.val('OFF');

            $text.val('OFF');

            if (!this.hasClass('btn-default')) {
                this.val('ON');
                this.removeClass('btn btn-danger').addClass('btn btn-success');
            }
        }
		else {
			this.val('OFF');
			this.removeClass('btn btn-success').addClass('btn btn-danger');
            $('canvas#paint-layer').remove();
		}
	}
});