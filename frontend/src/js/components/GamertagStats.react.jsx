var React = require('react');

module.exports = React.createClass({
  
  render: function() {
    var gt = this.props.gamertag;
    return (
      <div>
        <table className="gamertag-stats">
          <tr>

            <td>
              <h1>
                {gt.gamertag}
              </h1>
              <img src={'/images/svg/ranks/' + gt.csr_max + '.svg'}
                   alt={gt.csr_max}
                   title="Max CSR"/>
            </td>

            <td>
              <h3>Total Games</h3>
              <h2>{gt.games_played}</h2>
            </td>

          </tr>
        </table>

        <table className="gamertag-stats">
          <tr>

            <td>
              <h3>Win/Loss</h3>
              <h2>{gt.wl}</h2>
            </td>

            <td>
              <h3>K/D</h3>
              <h2>{gt.kd}</h2>
            </td>

          </tr>

        </table>

      </div>
    );
  }
});
/*

        {gt.games_played ? 
        
          <div>
            <p>Games Played: {gt.games_played}</p>
            <p>Win/Loss Ratio: {gt.wl}</p>
            <p>Kill/Death Ratio: {gt.kd}</p>
            <p>Max Rank: {gt.csr_max}</p>
          </div>
          
          : 
          
          <p>No games played in MCC</p>
        }*/
