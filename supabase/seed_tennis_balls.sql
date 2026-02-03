TRUNCATE TABLE ball_links, ball_styles, ball_surfaces, ball_levels, tennis_balls RESTART IDENTITY;

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Penn', 'QST 36 Foam', 'Penn – QST 36 Foam', 'foam', 3, 5, 'The Penn QST 36 Foam ball is a super-soft, confidence-boosting starter ball made for kids aged 3–5 who are just meeting tennis for the first time. It moves slowly, doesn''t bounce too high, and gives little players plenty of time to swing, smile, and make contact. Because it''s forgiving and safe on any surface, it''s a favorite for coaches running beginner programs. Think of it as training wheels for tennis — fun, friendly, and frustration-free.', 10)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['beginner']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['hard','clay','grass','carpet']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['defensive','offensive','neutral']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://www.tennis-warehouse.com/Penn_QST_36_Foam_12_Ball_Bag/descpageHEAD-PQST36F.html'), ('youtube', 'https://www.youtube.com/watch?v=fE_E6M9WuV4')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Wilson', 'US Open Tourney Red Tennis Ball (24-Can Case)', 'Wilson – US Open Tourney Red Tennis Ball (24-Can Case)', 'red', 6, 7, 'This red ball is all about confidence and coordination for kids aged 6–7. Bigger, softer, and slower than a yellow ball, it helps young players rally sooner and enjoy the game instead of chasing missed shots. Inspired by the US Open, it gives kids a "real tennis" feeling while staying gentle and playful. Perfect for building early skills and keeping kids excited to come back to the court.', 20)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['beginner']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['hard','clay','grass','carpet']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['defensive','offensive','neutral']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://www.tennis-warehouse.com/Wilson_US_Open_Tourney_Red_Tennis_Ball_24_Can_Case/descpageWILSON-USOTR.html'), ('youtube', 'https://www.youtube.com/watch?v=KgRE3CLBV8k')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Dunlop', 'Stage 2 Orange Tennis Ball (24-Can Case)', 'Dunlop – Stage 2 Orange Tennis Ball (24-Can Case)', 'orange', 8, 9, 'The Dunlop Stage 2 Orange ball is the perfect bridge between beginner play and real match tennis for kids aged 8–9. It flies faster than a red ball but stays controlled, helping young players learn rally rhythm, movement, and proper swing mechanics. Its slightly livelier bounce keeps things exciting without overwhelming developing players.', 30)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['beginner']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['hard','clay','grass','carpet']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['defensive','offensive','neutral']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://www.tennis-warehouse.com/Dunlop_Stage_2_Orange_Tennis_Ball_24_Can_Case/descpageDUNLOP-DS2OBC.html'), ('youtube', 'https://www.youtube.com/watch?v=KgRE3CLBV8k')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Wilson', 'US Open Green Tournament Tennis Ball (24×3 Case)', 'Wilson – US Open Green Tournament Tennis Ball (24×3 Case)', 'green', 10, 11, 'The Wilson US Open Green ball is designed for kids aged 10–11 who are almost ready for full yellow balls. It plays about 75% of a regular ball, giving young players realistic speed and bounce while still being forgiving on timing and control.', 40)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['beginner','intermediate','advanced']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['hard','clay','grass','carpet']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['defensive','offensive','neutral']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://tennisexpress.com/collections/wilson-tennis-ball-juniors/products/wilson-us-open-green-tournament-tennis-ball-case-36886'), ('youtube', 'https://www.youtube.com/watch?v=KgRE3CLBV8k')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Penn', 'Tour Extra Duty', 'Penn – Tour Extra Duty', 'yellow', 12, NULL, 'Penn Tour Extra Duty Tennis Balls are yellow pressurized tennis balls that offer a beginner-friendly feel and versatile performance across hard, clay, grass, and carpet courts.', 50)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['beginner']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['hard','clay','grass','carpet']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['defensive','offensive','neutral']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://www.tennis-warehouse.com/Penn_Tour_Extra_Duty_Tennis_Balls_Single_Can/descpageHEAD-PENNTOUR.html'), ('youtube', 'https://www.youtube.com/watch?v=QKP3w4lV5tU')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('HEAD', 'Tour', 'HEAD – Tour', 'yellow', 12, NULL, 'HEAD Tour is a premium yellow tennis ball for intermediate to advanced players who want a reliable blend of control and topspin-friendly response across all court surfaces.', 50)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['intermediate','advanced']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['hard','clay','grass','carpet']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['defensive','neutral','baseline','topspin','control']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://www.amazon.com/Head-Tour-Tennis-Balls-Tube/dp/B07HKMDTQ6'), ('youtube', 'https://www.youtube.com/watch?v=mF0z1EbL6Vw')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Wilson', 'Roland Garros Clay Court Ball', 'Wilson – Roland Garros Clay Court Ball', 'yellow', 12, NULL, 'A premium yellow clay-court tennis ball engineered for advanced players, built for slower, high-bounce conditions and extended rallies.', 50)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['advanced']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['clay']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['defensive','neutral','baseline','topspin','control','long_rallies','durability']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://www.amazon.com/Wilson-Roland-Garros-Clay-Tennis/dp/B086T4V5FX'), ('youtube', 'https://www.youtube.com/watch?v=VYz6l437Z0o&t=107s')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Dunlop', 'ATP Championship', 'Dunlop – ATP Championship', 'yellow', 12, NULL, 'A yellow tennis ball designed for intermediate players and everyday club-level play with balanced performance.', 50)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['intermediate']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['hard','clay','grass','carpet']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['neutral']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://smash-expert.com/601626-tennis-ball-dunlop-atp-championship-x3-white-black-one-size'), ('youtube', 'https://www.youtube.com/watch?v=q2kPunf5Cmo')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Dunlop', 'ATP Tour', 'Dunlop – ATP Tour', 'yellow', 12, NULL, 'High-performance ATP Tour ball designed for aggressive baseline play and fast hard-court rallies.', 50)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['intermediate','advanced']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['hard']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['offensive','high_bounce','topspin','baseline']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://www.tennis-warehouse.com/Dunlop_ATP_Tour_XD_Tennis_Ball_Single_Can/descpageDUNLOP-DATPXDR.html'), ('youtube', 'https://www.youtube.com/watch?v=q2kPunf5Cmo')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Wilson', 'US Open Extra Duty', 'Wilson – US Open Extra Duty', 'yellow', 12, NULL, 'Official US Open ball engineered for aggressive, high-pace hard-court play.', 50)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['advanced']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['hard']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['aggressive','offensive']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://www.amazon.com/Wilson-Open-Extra-duty-Tennis-Balls/dp/B00HXJN166'), ('youtube', 'https://www.youtube.com/watch?v=qzMWxvwzZkc')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Dunlop', 'Australian Open', 'Dunlop – Australian Open', 'yellow', 12, NULL, 'Official Australian Open ball offering balanced, all-round performance on hard courts.', 50)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['advanced']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['hard']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['neutral','all_round']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://www.tennis-warehouse.com/Dunlop_Australian_Open_XD_Tennis_Ball_Single_Can/descpageDUNLOP-DPAOBALL.html'), ('youtube', 'https://www.youtube.com/watch?v=q2kPunf5Cmo')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Dunlop', 'Fort Clay', 'Dunlop – Fort Clay', 'yellow', 12, NULL, 'Clay-court tennis ball designed for aggressive baseline play with consistent bounce and durability.', 50)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['intermediate','advanced']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['clay']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['offensive']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://www.amazon.com/Dunlop-Fort-Clay-Court-Balls/dp/B07MVNB7GG'), ('youtube', 'https://www.youtube.com/watch?v=MrjJ-iTilEo')) AS v(link_type, url);

WITH inserted_ball AS (
  INSERT INTO tennis_balls (brand, model, display_name, category, age_min, age_max, description, priority_rank)
  VALUES ('Slazenger', 'The Wimbledon Ball (1902)', 'Slazenger – The Wimbledon Ball (1902)', 'yellow', 12, NULL, 'The ITF-approved Wimbledon ball built for fast, aggressive play on grass and carpet courts.', 50)
  RETURNING id
),
ins_levels AS (INSERT INTO ball_levels (ball_id, level) SELECT id, unnest(ARRAY['beginner','intermediate','advanced']::player_level[]) FROM inserted_ball),
ins_surfaces AS (INSERT INTO ball_surfaces (ball_id, surface) SELECT id, unnest(ARRAY['grass','carpet']::court_surface[]) FROM inserted_ball),
ins_styles AS (INSERT INTO ball_styles (ball_id, style) SELECT id, unnest(ARRAY['aggressive','offensive']::play_style[]) FROM inserted_ball)
INSERT INTO ball_links (ball_id, link_type, url)
SELECT id, v.link_type, v.url FROM inserted_ball, (VALUES ('store', 'https://smash-expert.com/340939-tube-of-3-tennis-balls-slazenger-wimbledon-yellow-one-size'), ('youtube', 'https://www.youtube.com/watch?v=gJu9afFrS-k')) AS v(link_type, url);
