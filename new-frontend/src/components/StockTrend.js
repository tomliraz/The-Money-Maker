import React from 'react';
import ShowGraph from './ShowGraph';
 
const baseURL = "http://localhost:8081";

class StockTrend extends React.Component {

  constructor (props) {
    super(props);
    this.stockSymbol1 = props.stock1;
    this.stockSymbol2 = props.stock2;
    this.stockSymbol3 = props.stock3;
    this.data = [];
    // console.log(`${baseURL}/macd/${props.stock}/${props.fastPeriod}/${props.slowPeriod}/${props.start}/${props.end}`);
    this.changeGraph = (locProps) => {
      var fetchUrl = "";
      if (locProps.stockSymbol1 != '' && locProps.stockSymbol2 != '' && locProps.stockSymbol3 != '') {
        // 3 Stocks Selected
        this.stockSymbol1 = locProps.stock1;
        this.stockSymbol2 = locProps.stock2;
        this.stockSymbol3 = locProps.stock3;
        fetchUrl = `${baseURL}/trend/${locProps.stock1}/${locProps.stock2}/${locProps.stock3}/${locProps.start}/${locProps.end}`;
      } else if (locProps.stockSymbol1 != '' && locProps.stockSymbol2 != '') {
        // 2 Stocks Selected
        this.stockSymbol1 = locProps.stock1;
        this.stockSymbol2 = locProps.stock2;
        this.stockSymbol3 = '';
        fetchUrl = `${baseURL}/trend/${locProps.stock1}/${locProps.stock2}/${locProps.start}/${locProps.end}`;
      } else if (locProps.stockSymbol1 != '') {
        this.stockSymbol1 = locProps.stock1;
        this.stockSymbol2 = '';
        this.stockSymbol3 = '';
        fetchUrl = `${baseURL}/trend/${locProps.stock1}/${locProps.start}/${locProps.end}`;
      }

      fetch(fetchUrl,
      {
        method: "GET",
        mode: "cors",
        headers: {
          "Access-Control-Alow-Origin": "*",
          "Content-Type": "application/json"
        }
      })
      .then((response) => response.json())
      .then((response) => {
        this.data = response;
        this.setState({ 
          data: this.data, 
          stockSymbol1: this.stockSymbol1, 
          stockSymbol2: this.stockSymbol2,
          stockSymbol3: this.stockSymbol3
        });
      });
    };
    this.changeGraph(props);
  };

  componentWillReceiveProps(props) {
    this.changeGraph(props);
  }

  render (){
    const options = {
      title: 'Stock Trend - ' + this.stockSymbol,
      chartArea: { width: '80%' },
      hAxis: {
        title: 'Date',
      },
      vAxis: {
        title: 'Price',
      },
    };

    return (
      <div>
        <ShowGraph data={this.data} options={options}/>
      </div>
    );
  }
}
export default StockTrend;