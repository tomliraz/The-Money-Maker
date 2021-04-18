import React from 'react';
import TextField from '@material-ui/core/TextField';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
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
        fetch(`${baseURL}/macd/${props.stock}/${this.fastPeriod}/${this.slowPeriod}/${props.start}/${props.end}`,
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
      chartArea: { width: '75%' },
      hAxis: {
        title: 'Date',
      },
      vAxis: {
        title: 'Price',
      },
    };

    return (
      <div>
        <Grid container justify="center">
          <TextField
            label="Fast Period"
            id="outlined-margin-dense"
            defaultValue={this.props.fastPeriod}
            value={this.fastPeriod}
            onChange={(event) => {
              this.fastPeriod = event.target.value;
              this.setState({fastPeriod: this.fastPeriod});
              var newProps = {...this.props};
              newProps.fastPeriod = event.target.value;
              this.updateGraph(newProps);
            }}
            type="number"
            min="2"
            max="250"
            margin="dense"
            variant="outlined"
            style={{ marginRight: "1em" }}
          />

          <TextField
            label="Slow Period"
            id="outlined-margin-dense"
            defaultValue={this.props.slowPeriod}
            value={this.slowPeriod}
            onChange={(event) => {
              this.slowPeriod = event.target.value;
              this.setState({slowPeriod: this.slowPeriod});
              var newProps = {...this.props};
              newProps.slowPeriod = event.target.value;
              this.updateGraph(newProps);
            }}
            type="number"
            min={this.fastPeriod}
            max="1000"
            margin="dense"
            variant="outlined"
            style={{ marginLeft: "1em" }}
          />
        </Grid>

        {this.data && <ShowGraph data={this.data} options={options} />}
        {!this.data && 
        <div>
          <CircularProgress color="inherit" />
        </div>}
      </div>
    );
  }
}
export default MACD;