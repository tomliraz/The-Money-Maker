import React from 'react';
import ShowGraph from './ShowGraph';
 
const baseURL = "http://localhost:8081";

class Seasonal extends React.Component {

  constructor (props) {
    super(props);
    this.stockSymbol = props.stock;
    this.data = [];
    this.setGraph = (locProps) => {
      fetch(`${baseURL}/seasonal/${locProps.stock}/${locProps.interval}/${locProps.start}/${locProps.end}`,
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
    this.stockSymbol = props.stock;
    this.setState({ stockSymbol: this.stockSymbol });
    this.setGraph(props);
  }

  render() {
    const options = {
      title: 'Seasonal Trends of ' + this.stockSymbol1,
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
export default Seasonal;