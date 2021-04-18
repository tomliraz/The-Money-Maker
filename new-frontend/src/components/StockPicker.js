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
          console.log(response);
          this.stocks = response;
          this.setState({stocks: this.stocks});
        });
    }

    render () {
        return (
            <Autocomplete
              id="stock-picker"
              options={this.stocks}
              onSelect={this.props.onChange}
              getOptionLabel={(option) => option[1]}
              style={{ width: 400, marginTop: "1em"}}
              renderInput={(params) => <TextField {...params} label="Stock" variant="outlined" />}
            />
          );
    }
}

export default StockPicker;

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
