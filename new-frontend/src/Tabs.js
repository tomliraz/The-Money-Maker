import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import HomePage from './components/Home';
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleStartDateChange = (date) => {
    if (isValidDate(date))
      setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    if (isValidDate(date))
      setEndDate(date);
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
      
      <TabPanel value={value} index={0}>
        <StockTrend />
      </TabPanel>

      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid container justify="space-around">
          <StockPicker />
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            margin="normal"
            format="yyyy-MM-dd"
            label="Start Date"
            defaultValue="2018-01-01"
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
            defaultValue="2019-01-01"
            value={endDate}
            onChange={handleEndDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change end date',
            }}
          />
        </Grid>
      </MuiPickersUtilsProvider>
      
      <TabPanel value={value} index={1}>
        <Correlation />
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <Seasonal />
      </TabPanel>
      
      <TabPanel value={value} index={3}>
        <Volatility />
      </TabPanel>
      
      <TabPanel value={value} index={4}>
        <MACD stock={"AAPL"} start={startDate.toISOString().substr(0,10)} end={endDate.toISOString().substr(0,10)} fastPeriod={11} slowPeriod={21}/>
      </TabPanel>
    </div>
  );
}
