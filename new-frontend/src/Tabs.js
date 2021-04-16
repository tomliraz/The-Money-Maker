import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import HomePage from './components/Home';
import StockTrend from './components/StockTrend';
import Correlation from './components/Correlation'
import Seasonal from './components/Seasonal'
import Volatility from './components/Volatility'
import MACD from './components/MACD'
import ShowGraph from './components/ShowGraph';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function SimpleTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
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
        <MACD />
      </TabPanel>
    </div>
  );
}
