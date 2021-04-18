import React from 'react';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import ShowGraph from './ShowGraph';

const baseURL = "http://localhost:8081";
class MACD extends React.Component {

  constructor (props) {
    super(props);
    this.stockSymbol = props.stock;
    this.slowPeriod = props.slowPeriod;
    this.fastPeriod = props.fastPeriod;
    this.data = null;
    // console.log(`${baseURL}/macd/${props.stock}/${props.fastPeriod}/${props.slowPeriod}/${props.start}/${props.end}`);
    this.updateGraph = (props) => {
      if (props.stock != ''){
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
          this.stockSymbol = props.stock;
          this.setState({data: this.data, stockSymbol: this.stockSymbol});
        });
      }
    }
    this.updateGraph(props);
  };

  componentWillReceiveProps(nextProps) {
    this.updateGraph(nextProps);
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
        <TextField
          label="Fast Period"
          id="outlined-margin-dense"
          defaultValue={this.props.fastPeriod}
          value={this.slowPeriod}
          onChange={(event) => {
            this.fastPeriod = event.target.value;
            this.setState({fastPeriod: this.fastPeriod});
          }}
          type="number"
          min="2"
          max="100"
          margin="dense"
          variant="outlined"
        />

        <TextField
          label="Slow Period"
          id="outlined-margin-dense"
          defaultValue={this.props.slowPeriod}
          value={this.slowPeriod}
          onChange={(event) => {
            this.slowPeriod = event.target.value;
            this.setState({slowPeriod: this.slowPeriod});
          }}
          type="number"
          min="2"
          max="100"
          margin="dense"
          variant="outlined"
        />

        <ShowGraph data={this.data} options={options} />
      </div>
    );
  }
}
export default MACD;