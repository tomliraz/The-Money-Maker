import { Chart } from "react-google-charts";
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  addSpacing: {
    [theme.breakpoints.up('sm')]: {
      // width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
}));

export default function ShowGraph(props) {

  const classes = useStyles();

  const data = props.data;
  const options = props.options;
  
  return (
    <div>
      {!data && (<CircularProgress  color="primary"/>)}
      {data && (
        <Grid container>
          <Grid item xs={12}>
          <Chart
            width={"100%"}
            height={(this.props.viewHeight) ?? '70vh'}
            chartType="LineChart"
            loader={<div>Loading Chart</div>}
            data={data}
            options={options}
          />            
        </Grid>
      </Grid>)}
    </div>
  )
}