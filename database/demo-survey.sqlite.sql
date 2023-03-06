INSERT INTO feedback_course(uuid) VALUES('ecdd61b7-bb94-4c2f-a946-3bba4447247e');
INSERT INTO feedback(feedback_course_id, teacher_id) VALUES (1, 3);

-- contestacion parcial por parte del profe 6 de 8
INSERT INTO answer(feedback_id, alternative_id) VALUES(1, 1);
INSERT INTO answer(feedback_id, alternative_id) VALUES(1, 7);
INSERT INTO answer(feedback_id, alternative_id) VALUES(1, 10);
INSERT INTO answer(feedback_id, alternative_id) VALUES(1, 15);
INSERT INTO answer(feedback_id, alternative_id) VALUES(1, 17);
INSERT INTO answer(feedback_id, alternative_id) VALUES(1, 24);


-- contestacion por parte de los estudiantes (5 con sus encuestas generadas)
INSERT INTO feedback(feedback_course_id, student_id, is_finished) VALUES(1, 1, 1);
INSERT INTO feedback(feedback_course_id, student_id) VALUES(1, 2);
INSERT INTO feedback(feedback_course_id, student_id) VALUES(1, 3);
INSERT INTO feedback(feedback_course_id, student_id) VALUES(1, 4);
INSERT INTO feedback(feedback_course_id, student_id) VALUES(1, 5);

INSERT INTO answer(feedback_id, alternative_id) VALUES(2, 36);
INSERT INTO answer(feedback_id, alternative_id) VALUES(2, 39);

INSERT INTO answer(feedback_id, alternative_id) VALUES(3, 33);

INSERT INTO answer(feedback_id, alternative_id) VALUES(4, 35);
