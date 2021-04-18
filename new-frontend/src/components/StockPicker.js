/* eslint-disable no-use-before-define */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

const baseURL = "http://localhost:8081";

class StockPicker extends React.Component{

    constructor(props) {
        super(props);
        this.stocks = [];
        fetch(`${baseURL}/stocks`,
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
          this.stocks = response;
          this.setState({stocks: this.stocks});
        });

        this.handleOnChange = (event) => {
            let currentValue = event.target.value;
            if (currentValue != ''){
                if (this.stocks.find(row => (row[1] === currentValue)) != undefined) {
                    this.props.onChange(currentValue);
                }
            }

        };
    }

    render () {
        return (
            <Autocomplete
              id="stock-picker"
              options={this.stocks}
              onSelect={this.handleOnChange}
              getOptionLabel={(option) => option[1]}
              style={{ width: 250, marginTop: "1em"}}
            //   value={this.stocks.find(row => row[1] === this.props.defaultValue)}
              renderInput={(params) => 
              <TextField {...params} 
                label={this.props.title}
                variant="outlined" />}
            />
          );
    }
}

export default StockPicker;

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
