let query = `<form class="ui form" id='query_form'>
                <div class="ui info message">
                    <div class="header">Leave those entries blank. Which you do not want to filter</div>
                </div>
                <div class="two fields">
                    <div class="field">
                        <label>ND</label>
                        <input type="number" placeholder="ND" name="ND">
                    </div>
                    <div class="field">
                        <label>NE</label>
                        <input type="text" placeholder="NE" name="NE">
                    </div>
                </div>
                <div class="field">
                    <label>TAX?</label>
                    <div class="four fields">
                        <div class="field">
                            <input type="number" placeholder="xxxxxxxx" name="TAX">
                        </div>
                        <div class="field">
                            <input type="number" placeholder="xxxx" readonly="" value="00000000">
                        </div>
                        <div class="field">
                            <input type="number" placeholder="xxxx" readonly="" value="00000000">
                        </div>
                        <div class="field">
                            <input type="number" placeholder="xxxx" readonly="" value="00000000">
                        </div>
                    </div>
                </div>
                <div class="field">
                    <label>TY?</label>
                    <div class="ui multiple search selection dropdown">
                        <input name="TY" type="hidden" value="">
                        <i class="dropdown icon"></i>
                        <div class="default text">Select TY option(s)</div>
                        <div class="menu" id="TY">`;

let query2 = `</div>
                    </div>
                </div>
                <div class="field">
                    <label>CAT?</label>
                    <div class="ui multiple search selection dropdown">
                        <input name="CAT" type="hidden" value="">
                        <i class="dropdown icon"></i>
                        <div class="default text">Select CAT option(s)</div>
                        <div class="menu" id="CAT">`;

let query3 = `</div>
                    </div>
                </div>
                <div class="field">
                    <!-- <button class="ui right floated button">Right Floated</button> -->
                    <input class="ui button" type="submit" value="Submit">
                </div>
            </form>`;
let skip = (line) => {
    let str = line.trim().split('=')[0].trim();
    if (str === "ND")
        return str;
    else if (str === "TAX") {
        return str;
    } else if (str === "TY") {
        return str;
    } else if (str === "CAT") {
        return str;
    } else {
        return "true";
    }
}
document.getElementById("my_form").addEventListener("submit", function (event) {
    event.preventDefault();
    let myfile = document.getElementById('myfile').files[0];
    let read = new FileReader();
    read.readAsBinaryString(myfile);
    read.onload = function () {
        let fileData = read.result,
            output = fileData.split('\n');

        while (skip(output[0]) == "true") {     //Removing unnecessary lines from Front
            output.shift();
        }
        while (skip(output[output.length - 1]) == "true") {     //Removing unnecessary lines from End
            output.pop();
        }
        let data = [];
        let TY = new Set();
        let CAT = new Set();
        for (let i = 0; i < output.length;) {
            const phone = new Object();
            phone.ND = output[i].trim().split('=')[1].split(' ')[0];
            phone.NE = output[i].trim().split('=')[2];
            // console.log('ND: ', output[i].trim().split('=')[1].split(' ')[0]);
            // console.log('NE: ', output[i].trim().split('=')[2]);
            i++;
            for (; i < output.length && skip(output[i]) != "ND"; i++) {
                if (skip(output[i]) != "true") {
                    let arr = output[i].trim().split('=')[1].trim().split('+');  //Value
                    let property = skip(output[i]);                              //Property name? CAT, TY, ...
                    arr.forEach(function (value, index) {
                        arr[index] = value.trim()
                        if (property === "TY") {
                            TY.add(value.trim());
                        } else if (property === "CAT") {
                            CAT.add(value.trim());
                        }
                    }, arr);
                    phone[property] = arr;
                    // console.log(skip(output[i]), arr);   
                }
            }
            data.push(phone);
        }

        let CAThtml = "", TYhtml = "";
        TY = [...(TY)].sort();
        CAT = [...(CAT)].sort();
        for (let item of TY) {
            TYhtml += `<option class="item" data-value="${item}">${item}</option>`;
        }
        for (let item of CAT) {
            CAThtml += ` <div class="item" data-value="${item}">${item}</div>`;
        }
        document.getElementById('query').innerHTML = query + TYhtml + query2 + CAThtml + query3;
        $('.ui.dropdown').dropdown();
        query_formListener(data);
    }
})
let query_formListener = (obj) => {
    console.log('HERE');
    let flag = true;
    document.getElementById('query_form').addEventListener("submit", function (event) {
        console.log('HERE2');
        event.preventDefault();
        const form = document.getElementById('query_form');
        const ND = form.elements['ND'].value;
        const NE = form.elements['NE'].value;
        const TAX = form.elements['TAX'].value;
        const TY = form.elements['TY'].value;
        const CAT = form.elements['CAT'].value;
        let data = obj;
        let data1 = [];
        // Query code
        if (ND.length != 0) {
            data1 = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i]['ND'] == ND) {
                    data1.push(data[i]);
                }
            }
            data = data1;
        }
        if (NE.length != 0) {
            data1 = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i]['NE'] == NE) {
                    data1.push(data[i]);
                }
            }
            data = data1;
        }
        if (TAX.length !== 0) {
            data1 = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i]['TAX'] !== undefined && data[i]['TAX'][0] === TAX) {
                    data1.push(data[i]);
                }
            }
            data = data1;
        }
        if (TY.length !== 0) {
            data1 = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i]['TY'] !== undefined) {
                    let setTY = new Set(data[i]['TY']);
                    let arr = TY.split(',').filter(x => !setTY.has(x));
                    if (arr.length === 0) {
                        data1.push(data[i]);
                    }
                }
            }
            data = data1;
        }
        if (CAT.length !== 0) {
            data1 = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i]['CAT'] !== undefined) {
                    let setCAT = new Set(data[i]['CAT']);
                    let arr = CAT.split(',').filter(x => !setCAT.has(x));
                    if (arr.length === 0) {
                        data1.push(data[i]);
                    }
                }
            }
            data = data1;
        }
        //Query count details display
        let main = `<div class="ui segment" id="count">
                    </div>
                    <a class="ui fluid blue button popupModal" href="#">
                        <i class="download icon"></i> Download
                    </a>`;
        // `<div class="ui two buttons">
        //     <a class="ui negative button" id="myButton1" href="#">
        //         <i class="download icon"></i> Download only ND
        //     </a>
        //     <a class="ui positive button" id="myButton2" href="#">
        //         <i class="download icon"></i> Download all
        //     </a>
        // </div>`;
        if (flag) {
            document.getElementById('main').innerHTML += main;
            $('.ui.tiny.modal').modal('attach events', '.popupModal', 'show');
            flag = false;
        }
        let count = `<div class="ui positive message">
                        <div class="header">
                            <p>${data.length} Matching records found</p>
                        </div>
                    </div>`;
        document.getElementById('count').innerHTML = count;
        // Download button & query display
        let res = `<table class="ui celled table" >
                                    <thead>
                                        <tr>
                                            <th>S.No.</th>
                                            <th>ND</th>
                                            <th>NE</th>
                                            <th>TAX</th>
                                            <th>TY</th>
                                            <th>CAT</th>
                                        </tr>
                                    </thead>
                                    <tbody>`;
        data.forEach(function (object, index) {
            res += `<tr><td data-label="S.No.">${index + 1}</td>`;
            res += `<td data-label="${ND}">${object['ND']}</td>`;
            res += `<td data-label="${NE}">${object['NE']}</td>`;
            if (object['TAX'] !== undefined) {
                res += `<td data-label="TAX">${object['TAX'][0]}</td>`;
            }
            if (object['TY'] !== undefined) {
                res += `<td data-label="TY">${object['TY'].join(' + ')}</td>`;
            }
            if (object['CAT'] !== undefined) {
                res += `<td data-label="CAT">${object['CAT'].join(' + ')}</td>`;
            }
            res += "</tr>";
        });
        res += `</tbody></table >`;
        document.getElementById('output').innerHTML = res;
        Download(data);
    })
}

let Download = (obj) => {
    document.getElementById('DownloadSubmit').onclick = function (event) {
        console.log('Inside Download Form');
        let data = obj;
        const form = document.getElementById('download_form');
        const ND = form.elements['ND'].checked;
        const NE = form.elements['NE'].checked;
        const TAX = form.elements['TAX'].checked;
        const TY = form.elements['TY'].checked;
        const CAT = form.elements['CAT'].checked;
        console.log(ND);
        console.log(NE);
        console.log(TAX);
        console.log(TY);
        console.log(CAT);
        let fileDownload = "";
        data.forEach(function (object, index) {
            if (ND) {
                fileDownload += `ND= ${object['ND']},`;
            }
            if (NE) {
                fileDownload += `NE= ${object['NE']}, `;
            }
            if (TAX) {
                if (object['TAX'] !== undefined) {
                    fileDownload += `TAX= ${object['TAX'][0]},`;
                }
            }
            if (TY) {
                if (object['TY'] !== undefined) {
                    fileDownload += `TY= ${object['TY'].join(' + ')},`;
                }
            }
            if (CAT) {
                if (object['CAT'] !== undefined) {
                    fileDownload += `CAT= ${object['CAT'].join(' + ')},`;
                }
            }
            fileDownload += `\n`;
        });
        console.log('Download');
        // console.log(fileDownload);
        let blob = new Blob([fileDownload], { type: "text/plain;charset=utf-8" });
        let blobUrl = window.URL.createObjectURL(blob);
        console.log(blobUrl);
        this.href = blobUrl;
        this.target = '_blank'; 
        // target filename
        this.download = 'file_output.txt';
    }
}