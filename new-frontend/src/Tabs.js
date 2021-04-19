import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import HomePage from './components/Home';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import StockTrend from './components/StockTrend';
import Correlation from './components/Correlation'
import Seasonal from './components/Seasonal'
import Volatility from './components/Volatility'
import MACD from './components/MACD';
import DateFnsUtils from '@date-io/date-fns';
import StockPicker from './components/StockPicker';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  formControl: {
    marginTop: "1em"
  }
}));

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function SimpleTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [startDate, setStartDate] = React.useState(new Date('2018-01-01')); 
  const [endDate, setEndDate] = React.useState(new Date('2019-01-01'));
  const [selectedStock, setSelectedStock] = React.useState("AAPL");
  const [selectedStock2, setSelectedStock2] = React.useState("MSFT");
  const [selectedStock3, setSelectedStock3] = React.useState("");
  const [interval, setInterval] = React.useState('D');


  const handleChange = (event, newValue) => {
    if (newValue != 0) {
      setValue(newValue);
      setInterval('M');
    } else {
      setValue(newValue);
      setInterval('D');
    }

    if (newValue == 1 && !selectedStock2) {
      setSelectedStock2("MSFT");
    }
  };

  const handleStartDateChange = (date) => {
    if (isValidDate(date))
      setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    if (isValidDate(date))
      setEndDate(date);
  };

  const handleStockPickerChange = (symbol) => {
    setSelectedStock(symbol); 
  };

  const handleStockPickerChange2 = (symbol) => {
    setSelectedStock2(symbol); 
  };

  const handleStockPickerChange3 = (symbol) => {
    setSelectedStock3(symbol); 
  };

  const handleIntervalChange = (event) => {
    setInterval(event.target.value);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Stock Trend" {...a11yProps(0)} />
          <Tab label="Correlation" {...a11yProps(1)} />
          <Tab label="Seasonal" {...a11yProps(2)} />
          <Tab label="Volatility" {...a11yProps(3)} />
          <Tab label="MACD" {...a11yProps(4)} />
        </Tabs>
      </AppBar>

      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid container justify="space-around">
          <StockPicker 
            onChange={handleStockPickerChange} 
            title="Stock" 
            value={selectedStock}
            />

          {(value == 0 || value == 1 || value == 3) && (
            <StockPicker 
              onChange={handleStockPickerChange2} 
              title="Stock 2"
              value={selectedStock2}
              />
          )}
          
          {(value == 0 || value == 3) && (
            <StockPicker 
              onChange={handleStockPickerChange3} 
              title="Stock 3"
              value={selectedStock3}
              />
          )}

          { (value !== 2 && value !== 4) &&
            (<FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="demo-simple-select-outlined-label">Interval</InputLabel>
              <Select
                labelId="interval-select-outlined-label"
                id="interval-select-outlined"
                value={interval}
                onChange={handleIntervalChange}
                label="Interval"
              >
                {(value == 0) && <MenuItem value={'D'}>Daily</MenuItem> }
                <MenuItem value={'M'}>Monthly</MenuItem>
                <MenuItem value={'Q'}>Quarterly</MenuItem>
                <MenuItem value={'Y'}>Yearly</MenuItem>
              </Select>
            </FormControl>) }


          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            margin="normal"
            format="yyyy-MM-dd"
            label="Start Date"
            value={startDate}
            onChange={handleStartDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change start date',
            }}
          />
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            margin="normal"
            label="End Date"
            format="yyyy-MM-dd"
            value={endDate}
            onChange={handleEndDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change end date',
            }}
          />
        </Grid>
      </MuiPickersUtilsProvider>

      <TabPanel value={value} index={0}>
        <StockTrend 
            stock1={selectedStock} 
            stock2={selectedStock2}
            stock3={selectedStock3}
            interval={interval} 
            start={startDate.toISOString().substr(0,10)} 
            end={endDate.toISOString().substr(0,10)}
            />
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <Correlation 
          stock1={selectedStock} 
          stock2={selectedStock2} 
          interval={interval} 
          start={startDate.toISOString().substr(0,10)} 
          end={endDate.toISOString().substr(0,10)}
          />
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <Seasonal stock={selectedStock} />
      </TabPanel>
      
      <TabPanel value={value} index={3}>
        <Volatility 
          stock1={selectedStock} 
          stock2={selectedStock2}
          stock3={selectedStock3}
          interval={interval} 
          start={startDate.toISOString().substr(0,10)} 
          end={endDate.toISOString().substr(0,10)}
        />      
      </TabPanel>
      
      <TabPanel value={value} index={4}>
        <MACD stock={selectedStock} start={startDate.toISOString().substr(0,10)} end={endDate.toISOString().substr(0,10)} fastPeriod={11} slowPeriod={21}/>
      </TabPanel>
    </div>
  );
}
