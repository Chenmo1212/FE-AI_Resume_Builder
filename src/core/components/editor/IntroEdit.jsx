import React from 'react';
import styled from 'styled-components';
import {Input as AntInput} from 'antd';
import {MarkDownField} from '../../widgets/MarkdownField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const referralStyles = {
  color: "#fff",
  fontSize: "0.7rem"
}

const Wrapper = styled.div`
  margin: 8px 0;
`;

const Topic = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 7px;
`;

const Input = styled(AntInput)`
  border: 1px solid #222;
  height: 2.625rem;
  padding: 0.625rem;
  max-width: 100%;
  background: #424242;
  color: #fff;
  border-radius: 2px;
  margin-bottom: 5px;
`;

export function IntroEdit({METADATA, state, update}) {
  const [isDisplayRef, setDisplayRef] = React.useState(state.referral);

  const handleReferral = (e) => {
    setDisplayRef(e.target.checked);
    update('referral', e.target.checked);
  }
  return (
    <>
      {METADATA.map((metadata) => (
        <Wrapper key={metadata.label}>
          <Topic>{metadata.label}</Topic>
          {metadata.type === 'Input' ? (
            <Input
              value={
                metadata.value.includes('.')
                  ? state[metadata.value.split('.')[0]][metadata.value.split('.')[1]]
                  : state[metadata.value]
              }
              data-label={metadata.value}
              onChange={(event) => update(event.target.dataset.label, event.target.value)}
            />
          ) : (
            <MarkDownField
              value={state[metadata.value]}
              setValue={(text) => update(metadata.value, text)}
            />
          )}
        </Wrapper>
      ))}

      <Wrapper style={referralStyles}>
        <Topic>Referral</Topic>
        <FormControlLabel
          control={<Switch checked={isDisplayRef} onChange={handleReferral}/>}
          label="Display Referral"/>
      </Wrapper>
    </>
  );
}
