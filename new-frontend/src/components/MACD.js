import React from 'react';
import ShowGraph from './ShowGraph';

const baseURL = "http://localhost:8081";
 
class MACD extends React.Component {

  constructor (props) {
    super(props);
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
      this.data = response;
      this.setState({data: this.data});
    });
  };

  render (){
    const options = {
      title: 'Population of Largest U.S. Cities',
      chartArea: { width: '20%' },
      hAxis: {
        title: 'Date',
        minValue: 0,
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