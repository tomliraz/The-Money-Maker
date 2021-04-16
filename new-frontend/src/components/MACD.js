import React from 'react';
import ShowGraph from './ShowGraph';

const baseURL = "http://localhost:8081";
 
function MACD(props) {

    const data = [
        {
          label: 'Series 1',
          data: [[0, -2], [1, 2], [2, 4], [3, 2], [4, 7]]
        },
        {
          label: 'Series 2',
          data: [[0, 3], [1, 1], [2, 5], [3, 6], [4, 4]]
        }
      ];
    
      const axis = [
        { primary: true, type: 'linear', position: 'bottom' },
        { type: 'linear', position: 'left' }
      ];

    const [goodData, setData] = React.useState([]);
    
    console.log(`${baseURL}/macd/${props.stock}/${props.fastPeriod}/${props.slowPeriod}/${props.start}/${props.end}`);
    fetch(`${baseURL}/macd/${props.stock}/${props.fastPeriod}/${props.slowPeriod}/${props.start}/${props.end}`,
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
    });

    return (
        <div>
            <ShowGraph data={data} axis={axis}/>
        </div>
    );
}
export default MACD;