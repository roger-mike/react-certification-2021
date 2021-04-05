import React, { useContext } from 'react';
import { Col, Row, Tag, Button, Divider } from 'antd';
import { LikeOutlined, DislikeOutlined, EyeOutlined } from '@ant-design/icons';
import Thumbnail from 'components/Thumbnail';
import { shortenCount } from 'utils/fns';
import { useVideos, useVideoDetail } from 'utils/hooks/useVideos';
import { getRelatedVideos, getVideoStatistics } from 'utils/api';
import { Context } from 'context/AppContext';

import {
  StyledIFrame,
  StyledVideoDetail,
  StyledRelatedVideosColumn,
  IFrameContainer,
  Title,
  FavoriteIcon,
  NonFavoriteIcon,
} from './VideoDetail.styles';

import { useAuth } from '../../providers/Auth';

const DEFAULT_VIDEO_DETAIL = {
  snippet: { title: '' },
  statistics: { viewCount: 0, likeCount: 0, dislikeCount: 0 },
};

const getVideoId = (video) => (video.id.videoId ? video.id.videoId : video.id);

const addToFavorites = (dispatch, video) =>
  dispatch({ type: 'ADD_FAVORITE_VIDEO', payload: video });

const removeFromFavorites = (dispatch, video) =>
  dispatch({ type: 'REMOVE_FAVORITE_VIDEO', payload: video });

const isInFavorites = (video, favorites) => {
  return favorites.findIndex((favoriteVideo) => favoriteVideo.id === video.id) !== -1;
};

const VideoDetail = ({ location }) => {
  const { state, dispatch } = useContext(Context);
  const { authenticated } = useAuth();
  const { video } = location.state;
  const [relatedVideos] = useVideos(() => getRelatedVideos(getVideoId(video)));
  const [videoDetail] = useVideoDetail(
    getVideoStatistics,
    getVideoId(video),
    DEFAULT_VIDEO_DETAIL
  );

  const listRelatedVideos = (items) =>
    items.map((v) => (
      <Col role="listitem" key={getVideoId(v)}>
        <Thumbnail data={v} />
      </Col>
    ));

  return (
    <StyledVideoDetail gutter={[22, 0]}>
      <Col span={18}>
        <IFrameContainer>
          <StyledIFrame
            role="application"
            title="video"
            id="player"
            videoId={getVideoId(video)}
            type="text/html"
            src={`https://www.youtube.com/embed/${getVideoId(video)}?enablejsapi=1`}
            frameBorder="0"
          />
        </IFrameContainer>
        <Title aria-label="detail-title">{videoDetail.snippet.title}</Title>
        <Row align="end">
          <Row>
            <Tag aria-label="detail-views" icon={<EyeOutlined />}>
              {shortenCount(videoDetail.statistics.viewCount)}
            </Tag>
            <Tag aria-label="detail-likes" icon={<LikeOutlined />}>
              {shortenCount(videoDetail.statistics.likeCount)}
            </Tag>
            <Tag aria-label="detail-dislikes" icon={<DislikeOutlined />}>
              {shortenCount(videoDetail.statistics.dislikeCount)}
            </Tag>
          </Row>
          <Row align="center">
            {authenticated ? (
              <Button
                size="small"
                style={{ borderColor: 'red' }}
                shape="circle"
                icon={
                  isInFavorites(videoDetail, state.favoriteVideos) ? (
                    <FavoriteIcon />
                  ) : (
                    <NonFavoriteIcon />
                  )
                }
                onClick={() =>
                  isInFavorites(videoDetail, state.favoriteVideos)
                    ? removeFromFavorites(dispatch, videoDetail)
                    : addToFavorites(dispatch, videoDetail)
                }
              />
            ) : null}
          </Row>
        </Row>
        <Divider />
        <Row>
          <Col
            aria-label="detail-description"
            span={20}
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {videoDetail.snippet.description}
          </Col>
        </Row>
      </Col>
      <StyledRelatedVideosColumn span={6}>
        <Row gutter={[0, 22]}>{listRelatedVideos(relatedVideos)}</Row>
      </StyledRelatedVideosColumn>
    </StyledVideoDetail>
  );
};

export default VideoDetail;
