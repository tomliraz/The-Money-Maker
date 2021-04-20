import React from 'react';
import ShowGraph from './ShowGraph';
 
const baseURL = "http://localhost:8081";
class Volatility extends React.Component {

  constructor (props) {
    super(props);
    this.stockSymbol1 = props.stock1;
    this.stockSymbol2 = props.stock2;
    this.stockSymbol3 = props.stock3;
    this.interval = props.interval;
    this.data = [0,0];

    this.changeGraph = (locProps) => {
      var fetchUrl = "";
      console.log(locProps.stock1, locProps.stock2, locProps.stock3);
      if (locProps.stock1 && locProps.stock2 && locProps.stock3) {
        // 3 Stocks Selected
        this.stockSymbol1 = locProps.stock1;
        this.stockSymbol2 = locProps.stock2;
        this.stockSymbol3 = locProps.stock3;
        fetchUrl = `${baseURL}/volatility/${locProps.stock1}/${locProps.stock2}/${locProps.stock3}/${locProps.interval}/${locProps.start}/${locProps.end}`;
      } else if (locProps.stock1 && locProps.stock2) {
        // 2 Stocks Selected
        this.stockSymbol1 = locProps.stock1;
        this.stockSymbol2 = locProps.stock2;
        this.stockSymbol3 = '';
        fetchUrl = `${baseURL}/volatility/${locProps.stock1}/${locProps.stock2}/${locProps.interval}/${locProps.start}/${locProps.end}`;
      } else if (locProps.stock1 !== '') {
        this.stockSymbol1 = locProps.stock1;
        this.stockSymbol2 = '';
        this.stockSymbol3 = '';
        fetchUrl = `${baseURL}/volatility/${locProps.stock1}/${locProps.interval}/${locProps.start}/${locProps.end}`;
      }

      console.log(fetchUrl);
      fetch(fetchUrl,
      {
        method: "GET",
        headers: {
          "Access-Control-Alow-Origin": "*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        }
      })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
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
    console.log(props);
    this.changeGraph(props);
  }

  render (){
    const options = {
      title: 'Volatility - ' + this.stockSymbol1 + 
        ((this.stockSymbol2 != '') ? ", " + this.stockSymbol2 : "") +
        ((this.stockSymbol3 != '') ? ", " + this.stockSymbol3 : ""),
      chartArea: { width: '80%' },
      hAxis: {
        title: 'Date',
      },
      vAxis: {
        title: 'Volatility',
      },
    };

    return (
      <div>
        <ShowGraph data={this.data} options={options}/>
      </div>
    );
  }
}
export default Volatility;