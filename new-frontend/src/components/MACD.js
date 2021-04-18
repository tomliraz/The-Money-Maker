import React from 'react';
import ShowGraph from './ShowGraph';

const baseURL = "http://localhost:8081";
class MACD extends React.Component {

  constructor (props) {
    super(props);
    this.stockSymbol = props.stock;
    this.data = [];
    // console.log(`${baseURL}/macd/${props.stock}/${props.fastPeriod}/${props.slowPeriod}/${props.start}/${props.end}`);
    fetch(`${baseURL}/macd/${props.stock}/${props.fastPeriod}/${props.slowPeriod}/${props.start}/${props.end}`,
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
      this.data = response.map((arr) => {
        arr[0] = arr[0].substr(0,10);
        return arr;
      });
      this.setState({data: this.data});
    });
  };

  componentWillReceiveProps(nextProps) {
    fetch(`${baseURL}/macd/${nextProps.stock}/${nextProps.fastPeriod}/${nextProps.slowPeriod}/${nextProps.start}/${nextProps.end}`,
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
      this.data = response.map((arr) => {
        arr[0] = arr[0].substr(0,10);
        return arr;
      });
      this.stockSymbol = nextProps.stock;
      this.setState({data: this.nextProps, stockSymbol: this.stockSymbol});
    });
  }

  render (){
    const options = {
      title: 'MACD - ' + this.stockSymbol,
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
export default MACD;