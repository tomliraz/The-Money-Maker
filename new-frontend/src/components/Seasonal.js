import React from 'react';
import ShowGraph from './ShowGraph';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
 
const baseURL = "http://localhost:8081";
class Seasonal extends React.Component {

  constructor (props) {
    super(props);
    this.stockSymbol = props.stock;
    this.data = [0,0];
    this.startYear = 2010;
    this.endYear = 2019;
    this.startDay = "01-01";
    this.endDay = "06-01";

    this.setGraph = (locProps) => {
      fetch(`${baseURL}/seasonal/${locProps.stock}/${this.startYear}/${this.endYear}/${this.startDay}/${this.endDay}`,
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
    this.props = tempProps;
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
              if (event.target.value > 1900){
                this.startYear = event.target.value;
                this.setState({startYear: this.startYear});
                var newProps = {...this.props};
                this.setGraph(newProps);
              }
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
                this.endYear = event.target.value;
                this.setState({endYear: this.endYear});
                var newProps = {...this.props};
                this.setGraph(newProps);
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
            onChange={(event) => {
              this.startDay = event.target.value;
              this.setState({startDay: this.startDay});
              var newProps = {...this.props};
              this.setGraph(newProps);

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
            onChange={(event) => {
              this.endDay = event.target.value;
              this.setState({endDay: this.endDay});
              var newProps = {...this.props};
              this.setGraph(newProps);
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