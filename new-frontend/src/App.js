import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import grey from '@material-ui/core/colors/grey';
import HomeNav from './NavBar';
import TabBar from './Tabs';
const drawerWidth = 240;


const useStyles = makeStyles((theme) => ({
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  addSpacing: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
}));

const theme = createMuiTheme({
  palette: {
    primary: {
      main: green[800],
    },
    secondary: {
      main: grey[100]
    }
  },
});

export default function App() {

  const classes = useStyles();

  return (
    <Router>
      <ThemeProvider theme={theme}>
      <div>

        <HomeNav className={classes.appBar} />
        <TabBar className={classes.appBar} />
        {/* <StockListDrawer /> */}
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <div>
          <Switch>
            <Route path="/">
              <span />
            </Route>
          </Switch>
        </div>
      </div>
      </ThemeProvider>
    </Router>
  );
};
