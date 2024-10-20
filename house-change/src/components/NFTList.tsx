import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';

interface MyNFTIdListProps {
    NFTIdlist: string[];
    checked: number[];
    handleToggle: (value: number) => () => void;
}

//从上层父组件传入NFTIdlist，元素为NFT的ID
const NFTIdList:React.FC<MyNFTIdListProps> = ({ NFTIdlist , checked , handleToggle}) => {
  return (
    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      {NFTIdlist.map((value) => {
        const labelId = `checkbox-list-secondary-label-${value}`;
        return (
          <ListItem
            key={value}
            secondaryAction={
              <Checkbox
                edge="end"
                onChange={handleToggle(Number(value))}
                checked={checked.includes(Number(value))}
                inputProps={{ 'aria-labelledby': labelId }}
              />
            }
            disablePadding
          >
            <ListItemButton>
              <ListItemAvatar>
                <Avatar
                  alt={`Avatar n°${value}`}
                  src={`/static/images/avatar/${value}.jpg`}
                />
              </ListItemAvatar>
              <ListItemText id={labelId} primary={`Real Eatate ${value}`} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

export default NFTIdList;