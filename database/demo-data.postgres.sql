INSERT INTO public.user(name, email, password, encrypted_password, active, role, uuid) VALUES('Mrs. Ashley Aguilar', 'ashley.aguilar@mailinator.com', 'ashley.aguilar', 0, 1, 'User', '455fd91d-15ac-48b6-8b2a-e75d7891bbab');

INSERT INTO public.establishment(name, active) VALUES('st peter', 1);

INSERT INTO public.course(letter_id, establishment_id, grade_id, teacher_id) VALUES(3, 1, 7, 3);

INSERT INTO public.student(name, run, uuid) VALUES
    ('Rachel Booker', '32514884-5', 'af2ef79e-d86c-49d2-a426-3beaa380fe38'),
    ('Daniel Parker', '55421583-1', '722ebf37-c9d2-4137-8a0e-6caeeaa5841d'),
    ('Vickie Sullivan', '24096613-1', '77a06d10-2daf-4d60-9bbe-d116807f4d42'),
    ('Lauren Arellano', '79077443-4', '6d065a40-7b19-413f-b4bc-e28b9aaa7b4a'),
    ('Alexandra Herrera', '16455017-6', 'd7bd8582-9034-4ea2-b65e-53e314407797');

INSERT INTO public.course_student(course_id, student_id) VALUES (1, 1),(1, 2),(1, 3),(1, 4),(1, 5);

-- encuesta para profesor
INSERT INTO public.topic(title, number, survey_id) VALUES ('conocimiento programacion', 1, 1);

INSERT INTO public.question(topic_id, description) VALUES(1, 'con que lenguaje se desarrollo esta aplicacion?');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(1, 'A', 1, 'Node JS');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(1, 'B', 2, 'Java');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(1, 'C', 0, 'Javascript');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(1, 'D', 1, 'React');

INSERT INTO public.question(topic_id, description) VALUES(1, 'que paradigma de programacion es invalido?');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(2, 'A', 2, 'programacion orientada a objetos');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(2, 'B', 1, 'programacion orientada a aspectos');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(2, 'C', 1, 'programacion orientada a restricciones');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(2, 'D', 0, 'ninguna de las anteriores');

INSERT INTO public.topic(title, number, survey_id) VALUES ('Base de datos', 2, 1);

INSERT INTO public.question(topic_id, description) VALUES(2, 'que base de datos se esta utilizando?');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(3, 'A', 2, 'ninguna de las anteriores');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(3, 'B', 0, 'PostgreSQL');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(3, 'C', 1, 'SQLite');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(3, 'D', 1, 'MongoDB');

INSERT INTO public.question(topic_id, description) VALUES(2, 'cual de todas estas no es una DB');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(4, 'A', 1, 'CockroachDB');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(4, 'B', 0, 'AlligatorDB');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(4, 'C', 2, 'Apache Cassandra');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(4, 'D', 1, 'DuckDB');

INSERT INTO public.topic(title, number, survey_id) VALUES ('GIT', 3, 1);

INSERT INTO public.question(topic_id, description) VALUES(3, 'que comando se usa para ingresar cambios al staging area');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(5, 'A', 1, 'git commit');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(5, 'B', 2, 'git save');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(5, 'C', 1, 'git push');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(5, 'D', 0, 'git add');

INSERT INTO public.question(topic_id, description) VALUES(3, 'que comando nos ayuda a descubrir el commit que metio un bug en el historial');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(6, 'A', 2, 'git reflog');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(6, 'B', 1, 'git reset');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(6, 'C', 0, 'git bisect');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(6, 'D', 1, 'git checkout');

INSERT INTO public.topic(title, number, survey_id) VALUES ('variados', 4, 1);

INSERT INTO public.question(topic_id, description) VALUES(4, 'que sistema operativo es mejor para el gaming');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(7, 'A', 1, 'Linux');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(7, 'B', 0, 'Windows');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(7, 'C', 1, 'MacOS');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(7, 'D', 2, 'PlayStation');

INSERT INTO public.question(topic_id, description) VALUES(4, 'que prefiere ud, el tangananica o el tangananá');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(8, 'A', 0, 'a mi me gusta el tangananica');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(8, 'B', 1, 'yo prefiero el tangananá');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(8, 'C', 2, 'la mejor historia es tangananica');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(8, 'D', 1, 'el mejor verso es tangananá');


-- encuesta para alumno
INSERT INTO public.topic(title, number, survey_id) VALUES ('conocimiento pokemon', 1, 2);

INSERT INTO public.question(topic_id, description) VALUES(5, 'con cual pokemon es mas dificil comenzar');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(9, 'A', 1, 'bulbasaur');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(9, 'B', 0, 'charmander');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(9, 'C', 1, 'squartle');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(9, 'D', 2, 'ninguna de las anteriores');

INSERT INTO public.question(topic_id, description) VALUES(5, 'cual es la generacion de slaking');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(10, 'A', 2, 'primera generacion');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(10, 'B', 1, 'segunda generacion');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(10, 'C', 0, 'tercera generacion');
INSERT INTO public.alternative(question_id, letter, value, description) VALUES(10, 'D', 1, 'ninguna de las anteriores');
