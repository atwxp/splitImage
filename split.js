    // Util toolkit
    var util= {
      $: function(id){
        return typeof id == 'string' ? document.getElementById(id) : null;
      },
      cancel: function(event){
        event.preventDefault();
        event.stopPropagation();
      },
      val: function(value){
        return value && value > 0 ? value : 1;
      }
    };
  
  function handleFile(rowVal,columnVal,file){
    if(file){
      if(typeof file == 'string'){

        util.$("preview").innerHTML = '<img src="' + file + '" />';
        handlePiece(rowVal,columnVal,file);        
        return;
      }

      if(file.type & !file.type.match("image/")){
        alert("你上传的不是图片！");
        return;
      }
      // 文件超过2M
      if(file.size && file.size > 2 * 1024 * 1024){
        alert("请上传2M以内的图片哦，亲~~");
        return;
      }

      var reader = new FileReader();    
      reader.onload = function(event){
        var source = event.target.result;
        
        util.$("preview").innerHTML = '<img src="' + source + '" />';
        handlePiece(rowVal,columnVal,source);
      }
      reader.readAsDataURL(file);
    }
  }

  function initFile(){
    var previewDiv = util.$("preview"),
        fileInput = util.$("imgFile");
    
    var row  = util.$("row"),
        column = util.$("column");  

    var rowVal = util.val(row.value),
        columnVal = util.val(column.value);

    previewDiv.ondragenter = function(event){
      util.cancel(event);
      this.style.borderColor = "#f00";
    }
    previewDiv.ondragover = function(event){
      util.cancel(event);
    };
    previewDiv.ondragleave = function(){
      this.style.borderColor = "#00f";
    };
    previewDiv.ondrop = function(event){
      util.cancel(event);
      var file = event.dataTransfer.files[0];
      var html = event.dataTransfer.getData("text");
      file = file || html ;
      
      this.style.borderColor = "#00f";
      handleFile(rowVal,columnVal,file);
    }

    fileInput.onchange = function(){
      handleFile(rowVal,columnVal,this.files[0]);
    }
    
    row.onchange = function(){
      var img = previewDiv.getElementsByTagName("img");
      img = img ? img[0] : null;
      
      rowVal = util.val(row.value);
      columnVal = util.val(column.value);    
      handlePiece(rowVal,columnVal,img);
    };
    column.onchange = function(){
      var img = previewDiv.getElementsByTagName("img");
      img = img ? img[0] : null;
      
      rowVal = util.val(row.value);
      columnVal = util.val(column.value);
      handlePiece(rowVal,columnVal,img); 
    }
  }

  function handlePiece(row,column,source){
    if(source){
      if(typeof source == 'string'){
        var img = new Image();
        
        img.onload = function(){
          
          util.$("result").innerHTML = createPiece(row,column,img);
        }
        img.src = source;
      }        

      // img对象
      else {
        util.$("result").innerHTML = createPiece(row,column,source);
      }
    }
  }

  // 把img分成 row * column份，返回生成的html字符串
  function createPiece(row,column,img){
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");

    var wpiece = Math.floor(img.naturalWidth / column),
        hpiece = Math.floor(img.naturalHeight / row);

    var src = '',
        html = ''
        div = null;

    canvas.width = wpiece;
    canvas.height = hpiece;

    for(var i  = 0; i < row; i++){
      html += '<tr>';
      
      for(var j = 0; j < column; j++){
        ctx.drawImage(img,j * wpiece,i * hpiece,wpiece,hpiece,0,0,wpiece,hpiece);
        src = canvas.toDataURL();
        html += '<td><img src="' + src + '" /></td>';
      }
      html += '</tr>';
    }
    html = '<table>' + html + '</table>';
    
    return html;
  }
  window.onload = initFile;