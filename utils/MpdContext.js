import React from 'react';

const MpdContext = React.createContext({
  client: null,
  connect: params => {}
});

export default MpdContext;
