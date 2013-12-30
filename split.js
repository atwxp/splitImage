/**
 * @file split image into n * m pieces by upload or drag image
 * @author wxp
 */

/**
 * helper - 辅助函数
 *
 */
var util = {
    $: function (id) {
        return typeof id == 'string' ? document.getElementById(id) : null;
    },
    cancel: function (event) {
        event.preventDefault();
        event.stopPropagation();
    },
    val: function (value) {
        return value && value > 0 ? value : 1;
    }
};

/**
 * 文件预处理
 * 
 * @param {(string | File)} file 上传的文件对象或者url路径
 */
function handleFile(file) {
    if (file) {
        // 从其他页面拖拽图片，获取url路径，可能是data:url或者普通的url
        // todo: 兼容性不好,仅chrome支持
        if (typeof file == 'string') {
            var source = file.match(/src="([^\s"]+)/)[1];
            util.$('preview').innerHTML = '<img src="' + source + '" />';

            handlePiece(source);
        } 
        else if (!file.type || !file.type.match('image/')) {
            alert('你上传的不是图片！');
        }
        // 文件超过2M
        else if (!file.size || !file.size > 2 * 1024 * 1024) {
            alert("请上传2M以内的图片哦，亲~~");
        }

        /**
         * 文件读取完毕时触发
         *
         * @event
         * @param {Object} event
         */
        var reader = new FileReader();
        reader.onload = function (event) {
            source = event.target.result;
            util.$('preview').innerHTML = '<img src="' + source + '" />';
            handlePiece(source);
        };
        reader.readAsDataURL(file);
    }
}

/**
 * 初始化事件绑定
 * 
 */
function initFile() {
    var previewDiv = util.$('preview');
    var fileInput = util.$('imgFile');
    
    var row =  util.$('row');
    var column =  util.$('column');

    previewDiv.ondragenter = function (event) {
        util.cancel(event);
        this.style.borderColor = '#f00';
    };

    previewDiv.ondragover = function (event) {
        util.cancel(event);
    };

    previewDiv.ondragleave = function () {
        this.style.borderColor = '#00f';
    };

    previewDiv.ondrop = function (event) {
        util.cancel(event);
        
        var file = event.dataTransfer.files[0];
        var html = event.dataTransfer.getData('text/html');
        
        file = file || html ;
        this.style.borderColor = '#00f';
        handleFile(file);
    };

    /**
     * 通过input上传的文件发生改变时触发
     * 
     * @event
     */
    fileInput.onchange = function () {
        handleFile(this.files[0]);
    };
    
    /**
     * 分割宫格行列数发生变化时触发
     * 
     * @event
     */
    row.onchange = updateRowColumn;
    column.onchange = updateRowColumn;

    function updateRowColumn() {
        var img = previewDiv.getElementsByTagName('img');

        img = img ? img[0] : null;
        handlePiece(img);
    }
}

/**
 * 图片碎片预处理
 * 
 * @param {(string | Image)} source 可以是图片路径或者图片对象
 */
function handlePiece(source) {
    var rowVal =  util.$('row').value;
    var columnVal =  util.$('column').value;
    
    if (source) {
        if (typeof source == 'string') {
            var img = new Image();
            
            img.onload = function () {
                util.$('result').innerHTML = createPiece(img, rowVal, columnVal);
            };
            img.src = source;
        }
        else {
            util.$('result').innerHTML = createPiece(source, rowVal, columnVal);
        }
    } 
}

/**
 * 生成图片碎片
 * 
 * @param {Image} img 
 * @param {number=} row 分割宫格的行数
 * @param {number=} column 分割宫格的列数
 */
function createPiece(img, row, column) {
    row = util.val(row);
    column = util.val(column);

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    var wpiece = Math.floor(img.naturalWidth / column);
    var hpiece = Math.floor(img.naturalHeight / row);

    var src = '';
    var html = '';

    canvas.width = wpiece;
    canvas.height = hpiece;

    for (var i = 0; i < row; i++) {
        html += '<tr>';
        
        for (var j = 0; j < column; j++) {
            ctx.drawImage(
                img, 
                j * wpiece, i * hpiece, wpiece, hpiece, 
                0, 0, wpiece, hpiece
            );

            src = canvas.toDataURL();
            html += '<td><img src="' + src + '" /></td>';
        }
        html += '</tr>';
    }
    html = '<table>' + html + '</table>';
    return html;
}

window.onload = initFile;
