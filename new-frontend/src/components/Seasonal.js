import React from 'react';
import ShowGraph from './ShowGraph';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
 
const baseURL = "http://localhost:8081";

class Seasonal extends React.Component {

  constructor (props) {
    super(props);
    this.stockSymbol = props.stock;
    this.data = [];
    this.startYear = 2010;
    this.endYear = 2019;
    this.startDay = "01-01";
    this.endDay = "06-01";

    this.setGraph = (locProps) => {
      fetch(`${baseURL}/seasonal/${locProps.stock}/${locProps.startYear}/${locProps.endYear}/${locProps.startDay}/${locProps.endDay}`,
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
        console.log(response);
        this.data = response;
        this.setState({data: this.data});
      });
    }

    let tempProps = {...props};
    tempProps.startYear = 2010;
    tempProps.endYear = 2019;
    tempProps.startDay = "01-01";
    tempProps.endDay = "06-01";
    this.setGraph(tempProps);
  };

  componentWillReceiveProps(props) {
    this.stockSymbol = props.stock;
    this.setState({ stockSymbol: this.stockSymbol });
    this.setGraph(props);
  }

  render() {
    const options = {
      title: 'Seasonal Trends of ' + this.stockSymbol,
      chartArea: { width: '80%' },
      hAxis: {
        title: 'Date',
      },
      vAxis: {
        title: 'Seasonal Ratio',
        // viewWindow: {
        // min: -1,
        // max: 1
        // }
      },
    };

    return (
      <div>
        <Grid container justify="center">
          <TextField
            label="Start Year"
            id="start-year-input"
            value={this.startYear}
            onChange={(event, newValue) => {
              this.startYear = newValue;
              this.setState({startYear: this.startYear});
              var newProps = {...this.props};
              newProps.startYear = newValue;
              this.updateGraph(newProps);
            }}
            type="number"
            margin="dense"
            variant="outlined"
            style={{ marginRight: "1em" }}
          />
          <TextField
            label="End Year"
            id="start-year-input"
            value={this.endYear}
            onChange={(event, newValue) => {
              this.endYear = newValue;
              this.setState({endYear: this.endYear});
              var newProps = {...this.props};
              newProps.endYear = newValue;
              this.updateGraph(newProps);
            }}
            type="number"
            margin="dense"
            variant="outlined"
            style={{ marginRight: "1em" }}
          />

          <TextField
            label="Start Season"
            id="start-day-input"
            value={this.startDay}
            onChange={(event, newValue) => {
              this.startDay = newValue;
              this.setState({startDay: this.startDay});
              var newProps = {...this.props};
              newProps.startDay = newValue;
              this.updateGraph(newProps);
            }}
            type="text"
            margin="dense"
            variant="outlined"
            style={{ marginRight: "1em" }}
          />

          <TextField
            label="End Season"
            id="start-day-input"
            value={this.endDay}
            onChange={(event, newValue) => {
              this.endDay = newValue;
              this.setState({endDay: this.endDay});
              var newProps = {...this.props};
              newProps.endDay = newValue;
              this.updateGraph(newProps);
            }}
            type="text"
            margin="dense"
            variant="outlined"
            style={{ marginRight: "1em" }}
          />
        </Grid>
        <ShowGraph data={this.data} options={options}/>
      </div>
    );
  }
}
export default Seasonal;