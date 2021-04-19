import React from 'react';
import ShowGraph from './ShowGraph';
 
const baseURL = "http://localhost:8081";

class Correlation extends React.Component {

  constructor (props) {
    super(props);
    this.stockSymbol1 = props.stock1;
    this.stockSymbol2 = props.stock2;
    this.data = [];
    // console.log(`${baseURL}/correlation/${props.stock1}/${props.stock2}/${props.interval}/${props.start}/${props.end}`);
    this.setGraph = (locProps) => {
      fetch(`${baseURL}/correlation/${locProps.stock1}/${locProps.stock2}/${locProps.interval}/${locProps.start}/${locProps.end}`,
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
    }
    this.setGraph(props);
  };

  componentWillReceiveProps(props) {
    this.stockSymbol1 = props.stock1;
    this.stockSymbol2 = props.stock2;
    this.setState({stockSymbol1: this.stockSymbol1, stockSymbol2: this.stockSymbol2});
    this.setGraph(props);
  }

  render (){
    const options = {
      title: 'Correlation - Between ' + this.stockSymbol1 + ' and ' + this.stockSymbol2,
      chartArea: { width: '80%' },
      hAxis: {
        title: 'Date',
      },
      vAxis: {
        title: 'Correlation Coefficient',
        viewWindow: {
        min: -1,
        max: 1
        }
      },
    };

    return (
      <div>
        <ShowGraph data={this.data} options={options}/>
      </div>
    );
  }
}
export default Correlation;