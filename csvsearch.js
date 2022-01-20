var type_selected = ['すべて', 'すべて', 'すべて'];

//CSVファイルを読み込む関数getCSV()の定義
function getCSV() {
    var req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
    //req.open("get", "ialist2009-2020.csv", true); // アクセスするファイルを指定
    req.open("get", "sample.csv", true); // アクセスするファイルを指定
    req.send(null); // HTTPリクエストの発行

    // レスポンスが返ってきたらconvertCSVtoArray()を呼ぶ	
    req.onload = function () {
        convertCSVtoArray(req.responseText); // 渡されるのは読み込んだCSVデータ
    }
}

// 読み込んだCSVデータを二次元配列に変換する関数convertCSVtoArray()の定義
function convertCSVtoArray(str) { // 読み込んだCSVデータが文字列として渡される
    var result = []; // 最終的な二次元配列を入れるための配列
    var tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成

    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
    for (var i = 0; i < tmp.length; ++i) {
        result[i] = tmp[i].split(',');
    }

    let csvs = [];
    let types = [];
    let types1 = [];
    let types2 = [];
    let types3 = [];
    for (r of result) {
        if (r[0] != '') {
            csvs.push({
                name: hankana2Zenkana(toHalfWidth(r[0])),
                type1: toHalfWidth(r[1]),
                type2: toHalfWidth(r[2]),
                type3: toHalfWidth(r[3])
            });
        }
    }
    // 重複を取り除く処理
    const uni_result = csvs.filter((element, index, self) =>
        self.findIndex(e =>
            e.name === element.name &&
            e.type1 === element.type1 && e.type2 === element.type2 && e.type3 === element.type3
        ) === index
    );
    csvs = uni_result;

    // types1,2,3にそれぞれの配列データを代入
    for (csv of csvs) {
        types1.push(csv.type1);
        types2.push(csv.type2);
        types3.push(csv.type3);
    }
    types1 = Array.from(new Set(types1));
    types2 = Array.from(new Set(types2));
    types3 = Array.from(new Set(types3));
    types.push(types1);
    types.push(types2);
    types.push(types3);


    for (type of types) {
        type[0] = 'すべて';
        //type.push('すべて')
        for (t of type) {
            t = String(t).replace(/\r?\n/g, '');
        }
    }
    //console.log(types);
    //console.log(Object.keys(csvs[0]).length);

    let table = document.createElement('table');
    table.classList = "table table-hover";
    document.querySelector('#result').prepend(table);

    // header
    {
        let thead = document.createElement('thead');
        table.appendChild(thead);
        let tr = document.createElement('tr');
        thead.appendChild(tr);
        let key = Object.keys(csvs[0]);
        for (let i = 0; i < key.length; i++) {
            //console.log(key[i], csvs[0][key[i]]);
            let th = document.createElement('th');
            th.setAttribute('scope', "col");
            if (i == 0) th.style = "width:30%";
            else th.style = "width:25%";
            th.innerHTML = csvs[0][key[i]];
            tr.appendChild(th);

            if (i > 0) {
                let select = document.createElement('select');
                select.classList = "form-select";
                select.addEventListener('change', function (e) {
                    //console.log(this.selectedIndex);
                    type_selected[i - 1] = types[i - 1][this.selectedIndex];
                    //console.log(type_selected);
                    search();
                })
                th.appendChild(select);
                for (type of types[i - 1]) {
                    let option = document.createElement('option');
                    option.value = type;
                    option.innerHTML = type;
                    select.appendChild(option);
                }
            }
        }
    }
    // table data
    {
        let tbody = document.createElement('tbody');
        table.appendChild(tbody);

        let count = 0;
        for (csv of csvs) {
            if (count > 0) {
                let tr = document.createElement('tr');
                tbody.appendChild(tr);
                let key = Object.keys(csv);
                for (let i = 0; i < key.length; i++) {
                    //console.log(key[i], csv[key[i]]);
                    let td = document.createElement('td');
                    td.innerHTML = csv[key[i]];
                    if (i == 0) td.style = "font-weight:400";
                    tr.appendChild(td);
                }
            }
            count++;
        }
    }
    //    console.log(document.querySelector("#result"));
}

window.onload = function () {
    getCSV();
}

function search() {
    let count_found = 0;
    // get all td items
    let trs = document.querySelector('tbody').querySelectorAll('tr');
    let keyword = document.querySelector('#keyword').value;
    let keyword_kata = keyword.replace(/[ぁ-ん]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) + 0x60);
    });


    for (tr of trs) {
        let tds = tr.querySelectorAll('td');
        let flgs_hidden = [false, false, false, false];
        for (const [index, td] of tds.entries()) {
            if (index > 0) {
                if (type_selected[index - 1] === td.innerHTML ||
                    type_selected[index - 1] === 'すべて') {
                    flgs_hidden[index] = false;
                }
                else {
                    flgs_hidden[index] = true;
                }
            }
            else if (index == 0) {
                if (td.innerHTML.toUpperCase().indexOf(keyword.toUpperCase()) >= 0) {
                    flgs_hidden[index] = false;
                }
                else if (td.innerHTML.toUpperCase().indexOf(keyword_kata.toUpperCase()) >= 0) {

                }
                else {
                    flgs_hidden[index] = true;
                }
            }
        }
        //console.log(flgs_hidden);
        if (flgs_hidden[0] == false && flgs_hidden[1] == false &&
            flgs_hidden[2] == false && flgs_hidden[3] == false) {
            tr.hidden = false;
            count_found++;
        }
        else {
            tr.hidden = true;
        }
    }


    if (count_found == 0) {
        document.querySelector('#not_found').hidden = false;
    }
    else {
        document.querySelector('#not_found').hidden = true;
    }
}

function resetSearch() {
    document.querySelector('#keyword').value = '';
    type_selected = ['すべて', 'すべて', 'すべて'];
    console.log(type_selected);
    search();

    let options = document.querySelectorAll('option');
    console.log(options);
    for (option of options) {
        if (option.value == 'すべて') {
            option.selected = true;
        }
        else {
            option.selected = false;
        }
    }

}

/**
 * https://webllica.com/change-double-byte-to-half-width/
 * 全角から半角への変革関数
 * 入力値の英数記号を半角変換して返却
 * [引数]   strVal: 入力値
 * [返却値] String(): 半角変換された文字列
 */
function toHalfWidth(strVal) {
    //    console.log(strVal);
    // 半角変換
    var halfVal = strVal.replace(/[！-～]/g,
        function (tmpStr) {
            // 文字コードをシフト
            return String.fromCharCode(tmpStr.charCodeAt(0) - 0xFEE0);
        }
    );

    // 文字コードシフトで対応できない文字の変換
    return halfVal.replace(/”/g, "\"")
        .replace(/’/g, "'")
        .replace(/‘/g, "`")
        .replace(/￥/g, "\\")
        .replace(/　/g, " ")
        .replace(/〜/g, "~");
}


// https://www.yoheim.net/blog.php?q=20191101
function hankana2Zenkana(str) {
    var kanaMap = {
        'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
        'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
        'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
        'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
        'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
        'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
        'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
        'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
        'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
        'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
        'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
        'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
        'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
        'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
        'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
        'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
        'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
        'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
        '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・'
    };

    var reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
    return str
        .replace(reg, function (match) {
            return kanaMap[match];
        })
        .replace(/ﾞ/g, '゛')
        .replace(/ﾟ/g, '゜');
};