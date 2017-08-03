import { Component, ViewChild } from '@angular/core';
import { SelectComponent } from 'ng2-select';

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.scss'],
  templateUrl: './dashboard.html'
})
export class Dashboard {
    // chart filter base list
    private filterBaseModel = {
        _itemsWOCategories: [{id: -1, text: "All"}]
    };

    private chartData = {
        labels: ["Electricity", "Water"],
        datasets: [
            {
                "label": "High",
                "data": [12,4],
                "fill": true,
                "borderColor": "#d71d1d",
                "backgroundColor": "#d71d1d",
            },
            {
                "label": "Med",
                "data": [4,2],
                "fill": true,
                "borderColor": "#4bc0c0",
                "backgroundColor": "#4bc0c0",
            },
            {
                "label": "Low",
                "data": [4, 7],
                "fill": true,
                "borderColor": "#565656",
                "backgroundColor": "#565656",
            }
        ]
    };

    private pieChartData = {
        labels: ["New", "In Progress", "Pending", "Completed"],
        datasets: [
            {
                "label": "Single Request",
                "data": [1, 5, 2, 3],
                "fill": true,
                "backgroundColor": ["#4bc0c0", "#565656", "#a6a6a6", "#7836d1"],
            }
        ]
    }

    private options = {
        title: {
            display: true,
            text: 'Open WO per Category'
        },
        legend: {
            position: 'right'
        },
        scales: {
            xAxes: [{
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: "Category"
                },
            }],
            yAxes: [{
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: "Total WO"
                },
            }]
        }
    };

    // View Childs


    constructor() {

    }

    

    doOpenPopup() {
        let windowObj;

        windowObj = window.open(
            '',
            'Print WO',
            'resizable,scrollbars=yes,status=0,toolbar=0,menubar=0,location=0'
        );

        windowObj.document.open();
        windowObj.document.write('<div style="background-color: black;">a</div>');
        windowObj.document.close();
        windowObj.print();

        
    }
}
