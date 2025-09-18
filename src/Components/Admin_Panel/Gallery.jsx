import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import img1 from '../../assets/army-base.jpg';
import img2 from '../../assets/army-man-2.jpg';
import img3 from '../../assets/army-view.jpg';
import img4 from '../../assets/gun-4.jpg';
import img5 from '../../assets/gun-with-men.jpg';
import img6 from '../../assets/shooter.jpg';
import img7 from '../../assets/army-camp.jpg';
import img8 from '../../assets/army-field-3.jpg';

const Gallery = () => {

 

  const cards = [
    {
      id: 1,
      title: 'Army Base Camp',
      description: `A strategically located army base near \nthe coastline.This camp is equipped with\n modern facilities for communication, surveillance, and training operations.`,
      image: img1,
    },
    {
      id: 2,
      title: 'Army Men in Action',
      description: `A squad of soldiers in full gear.\nThey are advancing during a simulated urban \ncombat drill with smoke grenades and shields.`,
      image: img2,
    },
    {
      id: 3,
      title: 'Army Operation View',
      description: `A night operation in a busy district.\nThe setup includes coordination between ground \ntroops and urban command centers.`,
      image: img3,
    },
    {
      id: 4,
      title: 'Modern Assault Rifle',
      description: `High-tech rifle with mounted optics and \nsilencers.This weapon is standard issue for elite \nspecial forces during precision missions.`,
      image: img4,
    },
    {
      id: 5,
      title: 'Soldiers with Guns',
      description: `Elite commandos aiming their rifles during \nlive drills.Their formation and focus highlight \nadvanced training levels.`,
      image: img5,
    },
    {
      id: 6,
      title: 'Sniper in Action',
      description: `A camouflaged sniper lies hidden in thick \nvegetation.He uses a long-range scope to monitor \ntargets across a distant hill for accurate precision strikes.`,
      image: img6,
    },
    {
      id: 7,
      title: 'Army Tent Camp',
      description: `Tents set up for temporary deployment in \nhigh-altitude zones.It serves as a command post \nand resting station during mountain training.`,
      image: img7,
    },
    {
      id: 8,
      title: 'Training Field Zone',
      description: `An open ground dedicated to obstacle courses \nand military drills.Used daily by new recruits \nfor physical endurance and combat training.`,
      image: img8,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ padding: 3 }}>
     {cards.map((card) => {
  const MAX_LENGTH = 130;
  const truncated = card.description.length > MAX_LENGTH
    ? card.description.slice(0, MAX_LENGTH) + '...'
    : card.description.padEnd(MAX_LENGTH, ' ');

  return (
    <Grid item xs={12} sm={6} md={4} key={card.id}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom right, #1f1f1f, #2c2c2c)',
          color: '#fff',
          borderRadius: 4,
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-6px)',
          },
        }}
      >
        <CardMedia
          component="img"
          image={card.image}
          alt={card.title}
          sx={{
            height: 200,
            objectFit: 'cover',
          }}
        />
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {card.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-line',
              color: '#ccc',
            }}
          >
            {truncated}
          </Typography>
        </CardContent>
        <CardActions
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            px: 2,
            pb: 2,
          }}
        >
          <Tooltip title="View Group">
            <IconButton sx={{ color: '#90caf9' }}>
              <GroupIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Grid>
  );
})}

    </Grid>
  );
};

export default Gallery;
