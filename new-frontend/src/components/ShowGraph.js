import { Chart } from 'react-charts';
import Grid from '@material-ui/core/Grid';
import React from 'react';

export default function ShowGraph(props) {
    const data = React.useMemo(
      () => props.data,
      []
    )
   
    const axes = React.useMemo(
      () => props.axis,
      []
    )
   
    return (
        <Grid container>
            <Grid item xs={12}>
                <Chart data={data} axes={axes}  style={{ width: "100%", height: "70vh" }}/>
            </Grid>
        </Grid>
    )
  }